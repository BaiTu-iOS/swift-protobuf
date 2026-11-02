// Created by yuxilong on 2026/11/02.
module.exports = async ({ github, context, core }) => {
  const run = context.payload.workflow_run;
  if (run.conclusion !== 'failure' || run.run_attempt >= 3) return;

  const jobs = await github.paginate(github.rest.actions.listJobsForWorkflowRunAttempt, {
    ...context.repo,
    run_id: run.id,
    attempt_number: run.run_attempt,
  });
  for (const job of jobs) {
    if (job.name !== 'publish' || job.runner_id !== 0 || job.steps.length !== 0) continue;
    const annotations = await github.paginate(`${job.check_run_url}/annotations`);
    if (!annotations.some(({ message }) =>
      message === 'The job was not acquired by Runner of type hosted even after multiple attempts'
    )) continue;

    await github.rest.actions.reRunJobForWorkflowRun({ ...context.repo, job_id: job.id });
    core.info(`Retry requested for run ${run.id}, attempt ${run.run_attempt + 1}`);
  }
};
