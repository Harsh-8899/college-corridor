import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PATCH: Update user status or role with permission hierarchy check
export async function PATCH(request: Request, context: RouteContext) {
  const { id: targetId } = await context.params;
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: { message: "Unauthorized. Login required." } }, { status: 401 });
  }

  try {
    const actor = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { role: true }
    });

    if (!actor) {
      return NextResponse.json({ error: { message: "Actor profile not found." } }, { status: 401 });
    }

    const actorRole = actor.role?.name || "STUDENT";
    const actorId = actor.id;

    // Check if the actor is allowed to edit roles/users
    if (!["SUPER_ADMIN", "ADMIN"].includes(actorRole)) {
      return NextResponse.json({ error: { message: "Forbidden. Insufficient permissions." } }, { status: 403 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetId },
      include: { role: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: { message: "User not found." } }, { status: 404 });
    }

    const targetRole = targetUser.role?.name || "STUDENT";

    // No user can edit themselves
    if (actorId === targetId) {
      return NextResponse.json({ error: { message: "You cannot change your own status or role." } }, { status: 400 });
    }

    // Hierarchy check:
    // SUPER_ADMIN can manage SUPER_ADMIN (except self), ADMIN, COUNSELOR, UNIVERSITY_PARTNER, STUDENT.
    // ADMIN can manage COUNSELOR, UNIVERSITY_PARTNER, STUDENT.
    // ADMIN cannot manage SUPER_ADMIN or other ADMINs.
    if (actorRole === "ADMIN") {
      if (["SUPER_ADMIN", "ADMIN"].includes(targetRole)) {
        return NextResponse.json({ error: { message: "Forbidden. Admin cannot modify another Admin or Super Admin." } }, { status: 403 });
      }
    }

    const body = await request.json();
    const { status, role } = body;

    const updateData: any = {};
    if (status) {
      updateData.status = status;
    }
    if (role) {
      const roleRecord = await prisma.role.findUnique({
        where: { name: role }
      });
      if (!roleRecord) {
        return NextResponse.json({ error: { message: `Role ${role} does not exist.` } }, { status: 400 });
      }
      updateData.roleId = roleRecord.id;
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        role: { select: { name: true } }
      }
    });

    // Record system audit log
    await prisma.auditLog.create({
      data: {
        actorId: actorId,
        action: `UPDATE_USER_${targetRole}`,
        entityType: "USER",
        entityId: targetId,
        before: { status: targetUser.status, role: targetRole },
        after: { status: updatedUser.status, role: updatedUser.role?.name }
      }
    });

    return NextResponse.json({ data: updatedUser });
  } catch (error: any) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: { message: "Internal server error updating user." } }, { status: 500 });
  }
}

// DELETE: Deactivate/Suspend (soft-delete) user with permission hierarchy check
export async function DELETE(request: Request, context: RouteContext) {
  const { id: targetId } = await context.params;
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: { message: "Unauthorized. Login required." } }, { status: 401 });
  }

  try {
    const actor = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { role: true }
    });

    if (!actor) {
      return NextResponse.json({ error: { message: "Actor profile not found." } }, { status: 401 });
    }

    const actorRole = actor.role?.name || "STUDENT";
    const actorId = actor.id;

    // Check if the actor is allowed to delete/deactivate users
    if (!["SUPER_ADMIN", "ADMIN"].includes(actorRole)) {
      return NextResponse.json({ error: { message: "Forbidden. Insufficient permissions." } }, { status: 403 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetId },
      include: { role: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: { message: "User not found." } }, { status: 404 });
    }

    const targetRole = targetUser.role?.name || "STUDENT";

    // No user can delete/deactivate themselves
    if (actorId === targetId) {
      return NextResponse.json({ error: { message: "You cannot deactivate your own account." } }, { status: 400 });
    }

    // Hierarchy check:
    // SUPER_ADMIN can manage/delete/deactivate ADMIN, COUNSELOR, PARTNER, STUDENT
    // ADMIN can manage/delete/deactivate COUNSELOR, PARTNER, STUDENT
    // ADMIN cannot delete other SUPER_ADMINs or ADMINs
    if (actorRole === "ADMIN") {
      if (["SUPER_ADMIN", "ADMIN"].includes(targetRole)) {
        return NextResponse.json({ error: { message: "Forbidden. Admin cannot deactivate another Admin or Super Admin." } }, { status: 403 });
      }
    }

    // Prefer soft delete: Update user status to DELETED and set deletedAt timestamp
    const deactivatedUser = await prisma.user.update({
      where: { id: targetId },
      data: {
        status: "DELETED",
        deletedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true
      }
    });

    // Record system audit log
    await prisma.auditLog.create({
      data: {
        actorId: actorId,
        action: `DEACTIVATE_USER_${targetRole}`,
        entityType: "USER",
        entityId: targetId,
        before: { status: targetUser.status, role: targetRole },
        after: { status: "DELETED" }
      }
    });

    return NextResponse.json({ data: deactivatedUser });
  } catch (error: any) {
    console.error("Failed to deactivate user:", error);
    return NextResponse.json({ error: { message: "Internal server error deactivating user." } }, { status: 500 });
  }
}
