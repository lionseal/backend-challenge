import { Geometry } from "typeorm";
import { Task } from "../models/Task";
import { Job } from "./Job";
import { area } from "@turf/area";

interface PolygonAreaJobResult {
  area: number;
}

export class PolygonAreaJob implements Job {
  async run(task: Task): Promise<PolygonAreaJobResult> {
    try {
      const geoJson = JSON.parse(task.geoJson);
      if (!geoJson.type || !geoJson.coordinates) {
        throw new Error("Invalid GeoJSON object");
      }
      const area = this.calculateArea(geoJson);
      console.log(`Calculated area for task ${task.taskId}: ${area}`);
      // Returning an object with area, later it could be extended to include more details if needed
      // ie: number of nodes, triangles, center, etc.
      return { area };
    } catch (error) {
      console.error(`Error calculating area for task ${task.taskId}:`, error);
      // taskRunner will handle setting the task status to Failed
      throw error;
    }
  }

  /**
   * Calculate the area in square meters of a GeoJSON polygon using Turf.js
   */
  private calculateArea(geoJson: Geometry): number {
    return area(geoJson);
  }
}
