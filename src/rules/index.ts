import { MARRIAGE_RULES } from "./marriage";
import { CAREER_RULES } from "./career";
import { evaluate, type RuleFacts } from "./engine";
import type { FiredRule } from "./types";

export const RULES = { marriage: MARRIAGE_RULES, career: CAREER_RULES };

export function evaluateAll(facts: RuleFacts): { marriage: FiredRule[]; career: FiredRule[] } {
  return { marriage: evaluate(MARRIAGE_RULES, facts), career: evaluate(CAREER_RULES, facts) };
}

export type { FiredRule, Rule, Condition, Domain } from "./types";
export type { RuleFacts } from "./engine";
