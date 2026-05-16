import { useParams, Link } from "wouter";
import { 
  useGetProject, getGetProjectQueryKey,
  useListProjectMessages, getListProjectMessagesQueryKey,
  useCreateMessage,
  useListProjectFiles, getListProjectFilesQueryKey,
  useUploadProjectFile,
  useDeleteFile
} from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import { ArrowLeft, Edit, FileIcon, MessageSquare, Send, Trash2, Upload, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function ProjectDetail() {
  const { id } = useParams();
  const projectId = Number(id);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: project, isLoading: loadingProject } = useGetProject(projectId, {
    query: { enabled: !!projectId, queryKey: getGetProjectQueryKey(projectId) }
  });

  if (loadingProject) {
    return <div className="space-y-4"><Skeleton className="h-12 w-[300px]" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (!project) return <div>Project not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <Link href="/projects" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Projects
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl tracking-tight">{project.title}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-muted-foreground">For {project.clientName} • Created {format(new Date(project.createdAt), 'MMM d, yyyy')}</p>
          </div>
          <Link href={`/projects/${project.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="w-4 h-4" />
              Edit Settings
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
          <TabsTrigger value="overview" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-4 py-3">Overview</TabsTrigger>
          <TabsTrigger value="messages" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-4 py-3">Messages</TabsTrigger>
          <TabsTrigger value="files" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-4 py-3">Files</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Project Brief</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none text-sm">
                    {project.description ? (
                      <p className="whitespace-pre-wrap">{project.description}</p>
                    ) : (
                      <p className="text-muted-foreground italic">No description provided.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Service Type</p>
                    <p className="font-medium capitalize">{project.projectType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Budget</p>
                    <p className="font-medium">{project.budget ? `$${project.budget.toLocaleString()}` : 'Unspecified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Target Deadline</p>
                    <p className="font-medium">{project.deadline ? format(new Date(project.deadline), 'MMM d, yyyy') : 'TBD'}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Client Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium">{project.clientName}</p>
                    <a href={`mailto:${project.clientEmail}`} className="text-sm text-primary hover:underline">{project.clientEmail}</a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="messages" className="mt-0 h-[600px] flex flex-col">
          <MessagesTab projectId={projectId} />
        </TabsContent>

        <TabsContent value="files" className="mt-0">
          <FilesTab projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MessagesTab({ projectId }: { projectId: number }) {
  const { data: messages, isLoading } = useListProjectMessages(projectId, {
    query: { enabled: !!projectId, queryKey: getListProjectMessagesQueryKey(projectId) }
  });
  const createMessage = useCreateMessage();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const handleSend = () => {
    if (!content.trim()) return;
    createMessage.mutate({
      id: projectId,
      data: {
        content,
        authorName: "Jane Designer",
        authorRole: "designer"
      }
    }, {
      onSuccess: () => {
        setContent("");
        queryClient.invalidateQueries({ queryKey: getListProjectMessagesQueryKey(projectId) });
      }
    });
  };

  return (
    <Card className="flex-1 flex flex-col h-full overflow-hidden">
      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-2/3" />
              <Skeleton className="h-16 w-2/3 ml-auto" />
            </div>
          ) : messages?.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
              <p>No messages yet. Start the conversation.</p>
            </div>
          ) : (
            messages?.map((msg) => {
              const isDesigner = msg.authorRole === 'designer';
              return (
                <div key={msg.id} className={`flex flex-col ${isDesigner ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">{msg.authorName}</span>
                    <span className="text-[10px] text-muted-foreground">{format(new Date(msg.createdAt), 'h:mm a')}</span>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${isDesigner ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type a message..."
              className="min-h-[44px] h-[44px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button size="icon" className="shrink-0 h-[44px] w-[44px]" onClick={handleSend} disabled={!content.trim() || createMessage.isPending}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilesTab({ projectId }: { projectId: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: files, isLoading } = useListProjectFiles(projectId, {
    query: { enabled: !!projectId, queryKey: getListProjectFilesQueryKey(projectId) }
  });
  
  const uploadFile = useUploadProjectFile();
  const deleteFile = useDeleteFile();

  const handleSimulateUpload = () => {
    // In a real app, this would use a real file upload to S3/Cloudinary first
    // For this mockup, we just create a record with dummy URLs
    uploadFile.mutate({
      id: projectId,
      data: {
        filename: `mock-file-${Math.floor(Math.random() * 1000)}.pdf`,
        fileUrl: "https://example.com/mock-file.pdf",
        fileSize: Math.floor(Math.random() * 5000000) + 100000,
        mimeType: "application/pdf"
      }
    }, {
      onSuccess: () => {
        toast({ title: "File uploaded successfully" });
        queryClient.invalidateQueries({ queryKey: getListProjectFilesQueryKey(projectId) });
      }
    });
  };

  const handleDelete = (fileId: number) => {
    deleteFile.mutate({ id: fileId }, {
      onSuccess: () => {
        toast({ title: "File deleted" });
        queryClient.invalidateQueries({ queryKey: getListProjectFilesQueryKey(projectId) });
      }
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border border-dashed">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-full">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-medium">Upload Files</h4>
            <p className="text-sm text-muted-foreground">Share mockups, assets, or documents.</p>
          </div>
        </div>
        <Button onClick={handleSimulateUpload} disabled={uploadFile.isPending} variant="secondary">
          {uploadFile.isPending ? "Uploading..." : "Select File"}
        </Button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : files?.length === 0 ? (
          <div className="p-8 text-center border rounded-lg bg-card">
            <Paperclip className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No files uploaded yet.</p>
          </div>
        ) : (
          files?.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-4 bg-card border rounded-lg hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-4">
                <FileIcon className="w-8 h-8 text-primary/60" />
                <div>
                  <a href={file.fileUrl} target="_blank" rel="noreferrer" className="font-medium hover:text-primary hover:underline line-clamp-1">
                    {file.filename}
                  </a>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatBytes(file.fileSize)} • Uploaded {format(new Date(file.uploadedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(file.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
