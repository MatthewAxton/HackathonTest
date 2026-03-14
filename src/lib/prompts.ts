import type { PromptCategory } from '../analysis/types'

const PROMPTS: Record<PromptCategory, string[]> = {
  casual: [
    'Tell me about a hobby you enjoy and why it matters to you.',
    'Describe your ideal weekend and what you would do.',
    'Talk about a movie or book that changed how you think.',
    'What is something you learned recently that surprised you?',
    'If you could live anywhere in the world, where would it be and why?',
    'What is the best meal you have ever had and what made it special?',
    'Describe a trip or adventure that you will never forget.',
    'Talk about a skill you taught yourself and how you learned it.',
    'If you could have dinner with anyone, who would it be and why?',
    'What is a small daily habit that has made a big difference in your life?',
  ],
  professional: [
    'Describe a time you solved a difficult problem at work.',
    'Talk about why pace matters in communication.',
    'Explain a complex topic from your field to a complete beginner.',
    'Present your biggest professional achievement.',
    'Describe how you handle disagreements with coworkers.',
    'Walk me through a project you led from start to finish.',
    'What is the most important lesson you have learned in your career?',
    'Describe how you prioritise tasks when everything feels urgent.',
    'Talk about a time you had to adapt quickly to a major change at work.',
    'How do you build trust with a new team you have just joined?',
  ],
  interview: [
    'Tell me about yourself and why you are interested in this role.',
    'What is your greatest professional strength?',
    'Describe a time you faced a difficult challenge at work.',
    'Where do you see yourself in five years?',
    'Tell me about a conflict with a coworker and how you resolved it.',
    'Why are you leaving your current position?',
    'Give me an example of a time you showed leadership.',
    'What is your biggest weakness and how are you working on it?',
    'Describe a situation where you had to meet a tight deadline.',
    'Why should we hire you over other candidates?',
  ],
  reading: [
    'The art of public speaking is not about perfection. It is about connection. When you step onto a stage, your audience wants to feel that you are present with them, not reciting from memory.',
    'Innovation rarely comes from a single flash of genius. It grows from small experiments, repeated failures, and the stubborn belief that a better way exists just around the corner.',
    'Effective leaders listen more than they speak. They create space for others to share ideas, ask questions, and challenge assumptions without fear of judgement.',
    'The ocean stretched endlessly before her, its surface shimmering under the golden hour sun. She breathed deeply, tasting salt on her lips, and felt the weight of the week dissolve.',
    'Good design is invisible. When software works exactly as you expect, you never notice the thousands of decisions that made that experience feel effortless.',
    'Climate change is not a distant problem. It is reshaping coastlines, shifting growing seasons, and displacing communities right now. The question is not whether to act, but how fast.',
    'Music has a way of unlocking memories that words cannot reach. A single melody can transport you back twenty years, to a place you thought you had forgotten.',
    'The best conversations are the ones where both people walk away having changed their mind about something. Curiosity is more powerful than certainty.',
    'Every great city has a rhythm — the hum of morning traffic, the clatter of cafe dishes at noon, the quiet exhale of streetlights flickering on at dusk.',
    'Learning a new language is like gaining a second lens on reality. Words that have no translation reveal ideas your native tongue never needed to name.',
  ],
}

export default PROMPTS
