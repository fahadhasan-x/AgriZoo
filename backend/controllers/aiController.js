const { HfInference } = require('@huggingface/inference');
const hf = new HfInference(process.env.HF_API_KEY);

exports.generatePost = async (req, res) => {
  try {
    const { prompt } = req.body;

    // Use AI model to generate post
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.1',
      inputs: `Write an engaging social media post about agriculture based on this prompt: ${prompt}`,
      parameters: {
        max_length: 200,
        temperature: 0.7
      }
    });

    res.json({ content: response.generated_text });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Failed to generate post' });
  }
};

exports.analyzePost = async (req, res) => {
  try {
    const { content } = req.body;

    // Use AI model to analyze post
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.1',
      inputs: `Analyze this agricultural social media post and rate its potential engagement from 1-10. Also provide feedback for improvement: ${content}`,
      parameters: {
        max_length: 150,
        temperature: 0.3
      }
    });

    // Parse AI response to get score and feedback
    const analysis = parseAiResponse(response.generated_text);

    res.json({
      rating: {
        score: analysis.score,
        feedback: analysis.feedback
      }
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze post' });
  }
}; 
