"use client";

import { Search, Filter, SlidersHorizontal, Calendar, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Project } from "@/lib/types/project";

interface TaskFiltersProps {
  projects?: Project[];
}

export function TaskFilters({ projects = [] }: TaskFiltersProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const currentStatus = searchParams.get("status") || "all";
  const currentPriority = searchParams.get("priority") || "all";
  const currentDueDate = searchParams.get("dueDate") || "all";
  const currentProjectId = searchParams.get("projectId") || "all";

  return (
    <div className="bg-card p-4 rounded-2xl border border-border shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Search tasks..."
            className="pl-12 w-full h-10 text-base rounded-xl"
            defaultValue={searchParams.get("search")?.toString()}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 w-full md:flex md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 rounded-xl border-dashed px-4 w-full md:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={currentStatus === "all"}
                onCheckedChange={() => handleFilterChange("status", "all")}
              >
                All Statuses
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={currentStatus === "todo"}
                onCheckedChange={() => handleFilterChange("status", "todo")}
              >
                To Do
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={currentStatus === "in_progress"}
                onCheckedChange={() => handleFilterChange("status", "in_progress")}
              >
                In Progress
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={currentStatus === "done"}
                onCheckedChange={() => handleFilterChange("status", "done")}
              >
                Done
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 rounded-xl border-dashed px-4 w-full md:w-auto">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Priority
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={currentPriority === "all"}
                onCheckedChange={() => handleFilterChange("priority", "all")}
              >
                All Priorities
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={currentPriority === "high"}
                onCheckedChange={() => handleFilterChange("priority", "high")}
              >
                High
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={currentPriority === "medium"}
                onCheckedChange={() => handleFilterChange("priority", "medium")}
              >
                Medium
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={currentPriority === "low"}
                onCheckedChange={() => handleFilterChange("priority", "low")}
              >
                Low
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 rounded-xl border-dashed px-4 w-full md:w-auto">
                <Calendar className="h-4 w-4 mr-2" />
                Due Date
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by due date</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={currentDueDate === "all"}
                onCheckedChange={() => handleFilterChange("dueDate", "all")}
              >
                All Dates
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={currentDueDate === "today"}
                onCheckedChange={() => handleFilterChange("dueDate", "today")}
              >
                Today
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={currentDueDate === "week"}
                onCheckedChange={() => handleFilterChange("dueDate", "week")}
              >
                This Week
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={currentDueDate === "overdue"}
                onCheckedChange={() => handleFilterChange("dueDate", "overdue")}
              >
                Overdue
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 rounded-xl border-dashed px-4 w-full md:w-auto">
                <Folder className="h-4 w-4 mr-2" />
                Project
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by project</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={currentProjectId === "all"}
                onCheckedChange={() => handleFilterChange("projectId", "all")}
              >
                All Projects
              </DropdownMenuCheckboxItem>
              {projects.map((project) => (
                <DropdownMenuCheckboxItem
                  key={project.id}
                  checked={currentProjectId === project.id}
                  onCheckedChange={() => handleFilterChange("projectId", project.id)}
                >
                  {project.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
