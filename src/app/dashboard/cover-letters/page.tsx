import { getCoverLetters, deleteCoverLetter } from "@/app/actions/cover-letters";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Edit, Trash2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function CoverLettersPage() {
  const letters = await getCoverLetters();

  const handleDelete = async (id: string) => {
    "use server";
    await deleteCoverLetter(id);
    revalidatePath("/dashboard/cover-letters");
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar Navigation */}
      <div className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col justify-between flex-shrink-0 z-20">
        <div>
          <Link href="/dashboard" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-extrabold text-2xl text-slate-900">Cover Letters</span>
          </div>
          <p className="text-slate-500 text-sm mb-6">
            Craft tailored cover letters for every application to stand out from the crowd.
          </p>
          
          <Link href="/dashboard/cover-letters/new">
            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold h-12 rounded-lg transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              New Cover Letter
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-slate-900">Your Cover Letters</h1>
          </div>

          {letters.length === 0 ? (
            <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No Cover Letters</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                You haven't crafted any cover letters yet. Start writing one to increase your chances!
              </p>
              <Link href="/dashboard/cover-letters/new">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white">Create First Cover Letter</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {letters.map(letter => (
                <div key={letter.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative group flex flex-col h-64">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900 mb-2">{letter.title}</h3>
                    {letter.targetRole && (
                      <div className="text-sm font-medium text-slate-600 mb-1">{letter.targetRole}</div>
                    )}
                    {letter.targetCompany && (
                      <div className="text-sm font-medium text-teal-700">{letter.targetCompany}</div>
                    )}
                    
                    <p className="text-xs text-slate-400 mt-4">
                      Last edited: {new Date(letter.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <Link href={`/dashboard/cover-letters/${letter.id}`} className="flex-1">
                      <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50">
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </Button>
                    </Link>
                    <form action={handleDelete.bind(null, letter.id)}>
                      <Button type="submit" variant="ghost" className="text-slate-400 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
