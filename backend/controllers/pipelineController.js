import pipelineService from '../services/pipelineService.js';

async function refresh(req, res) {
  try {
    const result = await pipelineService.startPipeline();
    return res.status(202).json({ message: 'Pipeline started', jobId: result.jobId, pid: result.pid });
  } catch (error) {
    console.error('Failed to start pipeline', error);
    return res.status(500).json({ error: { message: 'Failed to start pipeline' } });
  }
}

async function status(req, res) {
  try {
    const jobs = pipelineService.listJobs();
    return res.json({ jobs });
  } catch (error) {
    console.error('Failed to list pipeline jobs', error);
    return res.status(500).json({ error: { message: 'Failed to list pipeline jobs' } });
  }
}

async function logs(req, res) {
  try {
    const jobId = req.params.jobId;
    const job = pipelineService.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: { message: 'Job not found' } });
    }

    return res.json({ jobId: job.id, pid: job.pid, status: job.status, logs: job.logs });
  } catch (error) {
    console.error('Failed to fetch logs', error);
    return res.status(500).json({ error: { message: 'Failed to fetch logs' } });
  }
}

export default { refresh, status, logs };
