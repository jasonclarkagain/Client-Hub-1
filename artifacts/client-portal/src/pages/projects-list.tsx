import { useState } from "wouter";
import { Link, useLocation } from "wouter";
import { useListProjects, getListProjectsQueryKey, ListProjectsStatus } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";

export function ProjectsList() {
  const [statusFilter, setStatusFilter] = React.useState<ListProjectsStatus | "all">("all");
  const [search, setSearch] = React.useState("");

  const { data: projects, isLoading } = useListProjects(
    statusFilter === "all" ? {} : { status: statusFilter },
    { query: { queryKey: getListProjectsQueryKey(statusFilter === "all" ? {} : { status: statusFilter }) } }
  );

  const filteredProjects = projects?.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.clientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl tracking-tight mb-2">Projects</h1>
          <p className="text-muted-foreground">Manage and track all studio requests.</p>
        </div>
        <Link href="/projects/new">
          <Button className="gap-2">
            <PlusCircle className="w-4 h-4" />
            New Request
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-lg border">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects or clients..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">In Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
        ) : filteredProjects?.length === 0 ? (
          <div className="col-span-full py-16 text-center border border-dashed rounded-lg">
            <p className="text-lg font-serif mb-1">No projects found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or create a new request.</p>
          </div>
        ) : (
          filteredProjects?.map(project => (
            <Link key={project.id} href={`/projects/${project.id}`} className="block group h-full">
              <Card className="h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <StatusBadge status={project.status} />
                    <span className="text-xs text-muted-foreground font-mono">#{project.id}</span>
                  </div>
                  
                  <h3 className="font-serif text-xl mb-1 group-hover:text-primary transition-colors line-clamp-1">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-1">{project.clientName}</p>
                  
                  <div className="mt-auto pt-4 border-t flex items-center justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{project.projectType.replace('_', ' ')}</span>
                    <span className="font-medium text-foreground">
                      {project.deadline ? format(new Date(project.deadline), 'MMM d') : 'No date'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
