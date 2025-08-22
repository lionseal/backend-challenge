import { WorkflowStep } from "../workflows/WorkflowFactory";

export function hasCycle(steps: WorkflowStep[]): boolean {
    const graph = new Map<string, string[]>();
    for (const step of steps) {
        graph.set(step.taskType, step.dependsOn ?? []);
    }
    const visited = new Set<string>();
    const visiting = new Set<string>();
    function dfs(node: string): boolean {
        if (visiting.has(node)) return true; // cycle found
        if (visited.has(node)) return false;
        visiting.add(node);
        for (const dep of graph.get(node) ?? []) {
            if (dfs(dep)) return true;
        }
        visiting.delete(node);
        visited.add(node);
        return false;
    }
    for (const step of graph.keys()) {
        if (dfs(step)) return true;
    }
    return false;
}
