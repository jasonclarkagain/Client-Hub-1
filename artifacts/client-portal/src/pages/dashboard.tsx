import { useGetDashboardSummary, useGetRecentActivity, useListProjects, getGetDashboardSummaryQueryKey, getGetRecentActivityQueryKey, getListProjectsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import { ArrowRight, FileText, MessageSquare, Briefcase, PlusCircle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() }
  });
  
  const { data: activities, isLoading: isLoadingActivity } = useGetRecentActivity({
    query: { queryKey: getGetRecentActivityQueryKey() }
  });

  const { data: projects, isLoading: isLoadingProjects } = useListProjects({}, {
    query: { queryKey: getListProjectsQueryKey({}) }
  });

  const activeProjects = projects?.filter(p => ['pending', 'in_progress', 'review'].includes(p.status)).slice(0, 4);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl tracking-tight mb-2">Welcome back.</h1>
          <p className="text-muted-foreground">Here's what's happening across your studio projects.</p>
        </div>
        <Link href="/projects/new">
          <Button className="hidden md:flex gap-2">
            <PlusCircle className="w-4 h-4" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Projects" 
          value={summary?.activeProjects} 
          isLoading={isLoadingSummary} 
          icon={Briefcase}
        />
        <StatCard 
          title="Pending Requests" 
          value={summary?.pendingProjects} 
          isLoading={isLoadingSummary}
          icon={Clock}
        />
        <StatCard 
          title="Completed" 
          value={summary?.completedProjects} 
          isLoading={isLoadingSummary}
          icon={CheckCircle2}
        />
        <StatCard 
          title="Files Shared" 
          value={summary?.totalFiles} 
          isLoading={isLoadingSummary}
          icon={FileText}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Projects List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl tracking-tight">Active Projects</h2>
            <Link href="/projects" className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {isLoadingProjects ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
            ) : activeProjects?.length === 0 ? (
              <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
                No active projects right now.
              </div>
            ) : (
              activeProjects?.map(project => (
                <Link key={project.id} href={`/projects/${project.id}`} className="block group">
                  <Card className="transition-all duration-200 hover-elevate">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{project.title}</h3>
                          <StatusBadge status={project.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">{project.clientName} • {project.projectType.replace('_', ' ')}</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-sm text-muted-foreground mb-1">Due Date</p>
                        <p className="font-medium">{project.deadline ? format(new Date(project.deadline), 'MMM d, yyyy') : 'TBD'}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <h2 className="text-2xl tracking-tight">Recent Activity</h2>
          <Card className="h-[400px] overflow-hidden flex flex-col">
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {isLoadingActivity ? (
                <div className="p-5 space-y-4">
                  {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : activities?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No recent activity.
                </div>
              ) : (
                <div className="divide-y">
                  {activities?.map(activity => (
                    <div key={activity.id} className="p-4 flex gap-3 text-sm">
                      <div className="mt-0.5 text-primary shrink-0">
                        {activity.type === 'message_posted' ? <MessageSquare className="w-4 h-4" /> :
                         activity.type === 'file_uploaded' ? <FileText className="w-4 h-4" /> :
                         activity.type === 'project_created' ? <PlusCircle className="w-4 h-4" /> :
                         <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-foreground">{activity.description}</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          {format(new Date(activity.createdAt), 'MMM d, h:mm a')} • {activity.projectTitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, isLoading, icon: Icon }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className="w-4 h-4 text-muted-foreground/50" />
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-3xl font-serif">{value || 0}</p>
        )}
      </CardContent>
    </Card>
  );
}
