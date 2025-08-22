import { describe, beforeEach, it, expect } from "@jest/globals";
import { PolygonAreaJob } from "./PolygonAreaJob";
import { Task } from "../models/Task";

describe("PolygonAreaJob", () => {
  let job: PolygonAreaJob;

  beforeEach(() => {
    job = new PolygonAreaJob();
  });

  it("returns the area of example polygon", async () => {
    const result = await job.run({
      taskId: "test",
      geoJson: JSON.stringify({
        type: "Polygon",
        coordinates: [
          [
            [-63.624885020050996, -10.311050368263523],
            [-63.624885020050996, -10.367865108370523],
            [-63.61278302732815, -10.367865108370523],
            [-63.61278302732815, -10.311050368263523],
            [-63.624885020050996, -10.311050368263523],
          ],
        ],
      }),
    } as Task);
    expect(result.area).toBeCloseTo(8363324.27);
  });

  it("throws when geoJson is missing coordinates", async () => {
    try {
      const result = await job.run({
        taskId: "test",
        geoJson: JSON.stringify({
          type: "Polygon",
        }),
      } as Task);
      throw new Error("Expected job to throw.");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toMatch(/Invalid GeoJSON object/);
    }
  });

  it("throws when geoJson is missing type", async () => {
    try {
      const result = await job.run({
        taskId: "test",
        geoJson: JSON.stringify({
          coordinates: []
        }),
      } as Task);
      throw new Error("Expected job to throw.");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toMatch(/Invalid GeoJSON object/);
    }
  });
});
