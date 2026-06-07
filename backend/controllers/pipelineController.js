import pipelineService from '../services/pipelineService.js';

async function refresh(req, res) {
  try {
    const result = await pipelineService.startPipeline();
    return res.status(202).json({ message: 'Pipeline started', pid: result.pid });
  } catch (error) {
    console.error('Failed to start pipeline', error);
    return res.status(500).json({ error: { message: 'Failed to start pipeline' } });
  }
}

export default { refresh };
