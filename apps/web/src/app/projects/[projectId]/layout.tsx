import { ProjectGate } from "@/features/project";

export default async function ProjectLayout({ children, params }: { children: React.ReactNode; params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <ProjectGate projectId={decodeURIComponent(projectId)}>{children}</ProjectGate>;
}
