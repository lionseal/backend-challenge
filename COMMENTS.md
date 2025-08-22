Step 1
1. done
2. done
3. done
4. Since there is no Task.output field, and taskRunner is storing task results in Result table, I'm using that. 
   Also since the output format is not specified, I declared it in the Job as an object that can be later extended if needed.

Extra: added tests and the job to the job factory.

Step 2
1. done
2. done
3. Tried to keep a human readable format for finalReport, had to add Task.result to fetch them in a single query.
4. Since it's using a Task and taskRunner, this is being handled automatically, I will probably have to change it in next steps.

Since it's not specified if this job should be manually added to the workflow yaml, I forced it as the last step so all workflows get this step.
A parameter could be added when creating the workflow to prevent this from being added automatically.
Or the report should be manually defined in each workflow yaml... (I said each, since that could also be a parameter to define which workflow you want to run)

Step 3
1. done
2. done
3. done
4. done, added cycle dependency detection

Note: added new workflow for testing cyclic dependencies, endpoint could be updated to accept workflow name...

Step 4
1. done
2. done
3. done

Removed forced task from step 2, it should be added manually to the workflow now (I added it to the basic example).
Extracted final report generation from ReportGenerationJob, I could call that job instead of the summary function, but this should be fine, for detailed output we could just fetch the workflow.tasks.output...

Step 5
1. done

Note: Organized the route as follows:
route definition => controller (calls the service and handles the response) => service (business logic)

Step 6
1. done