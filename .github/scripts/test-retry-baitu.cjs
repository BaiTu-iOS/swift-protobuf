// Created by yuxilong on 2026/11/02.
const assert = require('node:assert/strict');
const test = require('node:test');
const retry = require('./retry-baitu.cjs');

const allocationFailure = 'The job was not acquired by Runner of type hosted even after multiple attempts';
for (const scenario of [
  { name: 'retries an unassigned cancelled job', attempt: 1, expected: 1 },
  { name: 'allows the second retry', attempt: 2, expected: 1 },
  { name: 'stops after two retries', attempt: 3, expected: 0 },
  { name: 'does not retry a successful run', conclusion: 'success', expected: 0 },
  { name: 'does not retry a manually cancelled run', conclusion: 'cancelled', expected: 0 },
  { name: 'does not retry a job that started', job: { runner_id: 42, steps: [{}] }, expected: 0 },
  { name: 'does not retry unrelated errors', message: 'Compilation failed', expected: 0 },
  { name: 'does not retry other jobs', job: { name: 'other' }, expected: 0 },
]) {
  test(scenario.name, async () => {
    const calls = [];
    const repo = { owner: 'BaiTu-iOS', repo: 'swift-protobuf' };
    const attempt = scenario.attempt ?? 1;
    const listJobs = Symbol('listJobs');
    const github = {
      rest: { actions: {
        listJobsForWorkflowRunAttempt: listJobs,
        reRunJobForWorkflowRun: async (params) => calls.push(params),
      } },
      paginate: async (route, params) => {
        if (route === listJobs) {
          assert.deepEqual(params, { ...repo, run_id: 100, attempt_number: attempt });
          return [{ id: 200, name: 'publish', conclusion: 'cancelled', runner_id: 0,
            steps: [], check_run_url: 'https://api.github.com/check', ...scenario.job }];
        }
        assert.equal(route, 'https://api.github.com/check/annotations');
        return [{ message: scenario.message ?? allocationFailure }];
      },
    };
    await retry({ github, context: { repo, payload: { workflow_run: {
      id: 100, run_attempt: attempt, conclusion: scenario.conclusion ?? 'failure',
    } } }, core: { info() {} } });
    assert.deepEqual(calls, scenario.expected ? [{ ...repo, job_id: 200 }] : []);
  });
}
