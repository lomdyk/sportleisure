import { proxy, snapshot } from 'valtio';
import { supabase } from '../utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export interface TestSession {
  id: string;
  completed: boolean;
  
  // Pre-test
  age_group: string;
  pku_knowledge: string;
  dietary_restrictions: string; // "yes" or "no"
  
  // Metrics
  language: string;
  is_mobile: boolean;
  time_spent_total: number;
  time_spent_m1: number;
  time_spent_m2: number;
  time_spent_m3: number;
  max_scroll_depth: string;
  games_completed: string[];
  game_start_method: Record<string, string>; // e.g. { m1: 'overlay', m2: 'button' }
  m1_attempts: number;
  m2_attempts: number;
  m3_attempts: number;
  m1_mistakes: number;
  m3_collisions: number;
  footer_cards_flipped: number;
  downloaded_pdf: boolean;
  downloaded_game: boolean;
  
  // Post-test
  user_feelings: string[];
  biology_check: string;
  knowledge_check: string;
  food_check: string;
  sports_check: string;
  learned_new: string | null;
  feedback: string;
}

const initialState: TestSession = {
  id: '',
  completed: false,
  age_group: '',
  pku_knowledge: '',
  dietary_restrictions: '',
  language: 'en',
  is_mobile: false,
  time_spent_total: 0,
  time_spent_m1: 0,
  time_spent_m2: 0,
  time_spent_m3: 0,
  max_scroll_depth: 'hero',
  games_completed: [],
  game_start_method: {},
  m1_attempts: 0,
  m2_attempts: 0,
  m3_attempts: 0,
  m1_mistakes: 0,
  m3_collisions: 0,
  footer_cards_flipped: 0,
  downloaded_pdf: false,
  downloaded_game: false,
  user_feelings: [],
  biology_check: '',
  knowledge_check: '',
  food_check: '',
  sports_check: '',
  learned_new: null,
  feedback: '',
};

export const metricsState = proxy<TestSession>({ ...initialState });

let activeMissionId: 'main' | 'm1' | 'm2' | 'm3' = 'main';

export const metricsActions = {
  setActiveMission(mission: 'main' | 'm1' | 'm2' | 'm3') {
    activeMissionId = mission;
  },

  initSession(ageGroup: string, pkuKnowledge: string, restrictions: string, language: string) {
    metricsState.id = uuidv4();
    metricsState.age_group = ageGroup;
    metricsState.pku_knowledge = pkuKnowledge;
    metricsState.dietary_restrictions = restrictions;
    metricsState.language = language;
    metricsState.is_mobile = window.innerWidth < 768;
    
    // Initial insert
    this.syncToDb(true);
  },
  
  updateScrollDepth(sectionId: string) {
    const depths = ['hero', 'crew-greeting', 'mission-1', 'mission-2', 'mission-3', 'downloads', 'footer'];
    const currentIndex = depths.indexOf(metricsState.max_scroll_depth);
    const newIndex = depths.indexOf(sectionId);
    if (newIndex > currentIndex) {
      metricsState.max_scroll_depth = sectionId;
      this.syncToDb(); // Sync immediately when reaching a new section
    }
  },
  
  recordGameStart(missionId: string, method: 'overlay' | 'text_button') {
    if (!metricsState.game_start_method[missionId]) {
      metricsState.game_start_method[missionId] = method;
      this.syncToDb();
    }
  },
  
  recordGameComplete(missionId: string) {
    if (!metricsState.games_completed.includes(missionId)) {
      metricsState.games_completed.push(missionId);
      this.syncToDb(); // sync whenever they finish a game
    }
  },

  incrementAttempt(missionId: 'm1' | 'm2' | 'm3') {
    if (missionId === 'm1') metricsState.m1_attempts += 1;
    if (missionId === 'm2') metricsState.m2_attempts += 1;
    if (missionId === 'm3') metricsState.m3_attempts += 1;
    this.syncToDb();
  },

  recordMistake(missionId: 'm1' | 'm3', amount: number = 1) {
    if (missionId === 'm1') metricsState.m1_mistakes += amount;
    if (missionId === 'm3') metricsState.m3_collisions += amount;
  },

  recordCardFlip() {
    metricsState.footer_cards_flipped += 1;
  },
  
  addTime(category: 'total' | 'm1' | 'm2' | 'm3', seconds: number) {
    if (category === 'total') metricsState.time_spent_total += seconds;
    if (category === 'm1') metricsState.time_spent_m1 += seconds;
    if (category === 'm2') metricsState.time_spent_m2 += seconds;
    if (category === 'm3') metricsState.time_spent_m3 += seconds;
  },

  recordDownload(type: 'pdf' | 'game') {
    if (type === 'pdf' && !metricsState.downloaded_pdf) {
      metricsState.downloaded_pdf = true;
      this.syncToDb();
    }
    if (type === 'game' && !metricsState.downloaded_game) {
      metricsState.downloaded_game = true;
      this.syncToDb();
    }
  },

  async syncToDb(isInitial = false) {
    if (!metricsState.id) return;
    
    // Get a plain JS object from the proxy to avoid serialization issues with Supabase
    const state = snapshot(metricsState);
    
    try {
      if (isInitial) {
        const { error } = await supabase.from('test_sessions').insert([
          {
            id: state.id,
            age_group: state.age_group,
            pku_knowledge: state.pku_knowledge,
            dietary_restrictions: state.dietary_restrictions,
            language: state.language,
            is_mobile: state.is_mobile,
            max_scroll_depth: state.max_scroll_depth,
          }
        ]);
        if (error) console.error("Insert error:", error);
      } else {
        const { error } = await supabase.from('test_sessions').update({
          time_spent_total: state.time_spent_total,
          time_spent_m1: state.time_spent_m1,
          time_spent_m2: state.time_spent_m2,
          time_spent_m3: state.time_spent_m3,
          max_scroll_depth: state.max_scroll_depth,
          games_completed: [...state.games_completed],
          game_start_method: state.game_start_method,
          m1_attempts: state.m1_attempts,
          m2_attempts: state.m2_attempts,
          m3_attempts: state.m3_attempts,
          m1_mistakes: state.m1_mistakes,
          m3_collisions: state.m3_collisions,
          footer_cards_flipped: state.footer_cards_flipped,
          downloaded_pdf: state.downloaded_pdf,
          downloaded_game: state.downloaded_game,
          completed: state.completed,
          user_feelings: state.user_feelings,
          biology_check: state.biology_check,
          knowledge_check: state.knowledge_check,
          food_check: state.food_check,
          sports_check: state.sports_check,
          learned_new: state.learned_new ? state.learned_new === 'tyrosine' : null,
          feedback: state.learned_new ? `[Formula: ${state.learned_new}] ${state.feedback}` : state.feedback,
        }).eq('id', state.id);
        
        if (error) {
          console.error("Update error:", error);
          if (state.completed) {
            alert("Failed to submit final report: " + error.message);
          } else if (state.time_spent_total < 15) {
            alert("Database Error: " + error.message);
          }
        }
      }
    } catch (err) {
      console.error('Failed to sync metrics:', err);
    }
  },

  async finishSession(userFeelings: string[], biologyCheck: string, knowledgeCheck: string, foodCheck: string, sportsCheck: string, feedback: string, learnedNew: string | null = null) {
    metricsState.user_feelings = userFeelings;
    metricsState.biology_check = biologyCheck;
    metricsState.knowledge_check = knowledgeCheck;
    metricsState.food_check = foodCheck;
    metricsState.sports_check = sportsCheck;
    metricsState.learned_new = learnedNew;
    metricsState.feedback = feedback;
    metricsState.completed = true;
    
    return this.syncToDb();
  }
};

// Periodically save total time
setInterval(() => {
  if (metricsState.id && !metricsState.completed) {
    metricsActions.addTime('total', 5); // add 5 seconds
    if (activeMissionId !== 'main') {
      metricsActions.addTime(activeMissionId, 5);
    }
    
    // Sync every 5 seconds to ensure we capture drop-offs
    metricsActions.syncToDb();
  }
}, 5000);
