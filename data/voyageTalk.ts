import { EARLY_SCENES } from './talkEarly';
import { EPILOGUE, LATE_SCENES } from './talkLate';
import { CRISIS_TALK } from './crisisTalk';
import { TalkScene } from '../services/talk';

export const TALK_SCENES: TalkScene[] = [...EARLY_SCENES, ...LATE_SCENES, EPILOGUE];

export { CRISIS_TALK, EPILOGUE };
