import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { authOptions } from "@/lib/auth/options";
import { Badge } from "@/components/ui/badge";
import { User, BookOpen, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user?.role as string)) {
    redirect("/login");
  }

  const posts = await prisma.blogPost.findMany({
    include: {
      author: {
        select: { name: true, email: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Blog Articles</h1>
          <p className="mt-1 text-sm text-slate-500">
            Write, optimize, and moderate platform articles and SEO updates.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-left text-slate-500 font-semibold">
              <tr>
                <th className="p-4">Article</th>
                <th className="p-4">Category</th>
                <th className="p-4">Author</th>
                <th className="p-4">SEO Tags</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-emerald-600" />
                      <p className="font-semibold text-slate-800">{post.title}</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">/{post.slug}</p>
                  </td>
                  <td className="p-4">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">
                      {post.category}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>{post.author?.name || "System Admin"}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{post.author?.email}</p>
                  </td>
                  <td className="p-4">
                    {post.metaTitle || post.metaDescription ? (
                      <div className="space-y-1">
                        {post.metaTitle && (
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">
                            Title: {post.metaTitle}
                          </p>
                        )}
                        {post.metaDescription && (
                          <p className="text-xs text-slate-400 truncate max-w-[200px]">
                            Desc: {post.metaDescription}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">No SEO tags mapped</span>
                    )}
                  </td>
                  <td className="p-4">
                    {post.isPublished ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        Draft
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <AlertCircle className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    No articles written.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
