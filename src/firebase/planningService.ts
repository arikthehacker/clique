/**
 * ==============================
 * FILE: src/firebase/planningService.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Polls, to-dos, daily questions and expenses, each a subcollection under a group.
 *
 * Includes:
 * - subscribeToPolls and savePoll
 * - subscribeToTodos, saveTodo, deleteTodo
 * - subscribeToQuestions and saveQuestion
 * - subscribeToExpenses, saveExpense, deleteExpense
 *
 * Notes:
 * - A vote rewrites the whole poll, so the last write wins.
 */

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';

import {
  DailyQuestion,
  Expense,
  Poll,
  Todo,
} from '../types';
import { requireDb } from './firebaseConfig';

function subscribeTo<T>(
  groupId: string,
  name: 'polls' | 'todos' | 'questions' | 'expenses',
  convert: (id: string, data: Record<string, unknown>) => T,
  onChange: (items: T[]) => void,
  onError: (error: Error) => void,
): () => void {
  return onSnapshot(
    collection(requireDb(), 'groups', groupId, name),
    (snapshot) => onChange(snapshot.docs.map((item) => convert(item.id, item.data()))),
    onError,
  );
}

export function subscribeToPolls(
  groupId: string,
  onChange: (polls: Poll[]) => void,
  onError: (error: Error) => void,
): () => void {
  return subscribeTo<Poll>(
    groupId,
    'polls',
    (id, data) => ({
      id: id,
      groupId: groupId,
      question: String(data.question ?? ''),
      options: Array.isArray(data.options)
        ? data.options.map((option: Record<string, unknown>) => ({
            id: String(option.id ?? ''),
            text: String(option.text ?? ''),
            votes: Array.isArray(option.votes) ? option.votes.map(String) : [],
          }))
        : [],
      createdBy: String(data.createdBy ?? ''),
      closed: Boolean(data.closed),
      createdAt: Number(data.createdAt ?? 0),
    }),
    onChange,
    onError,
  );
}

export async function savePoll(poll: Poll): Promise<void> {
  await setDoc(doc(requireDb(), 'groups', poll.groupId, 'polls', poll.id), poll);
}

export function subscribeToTodos(
  groupId: string,
  onChange: (todos: Todo[]) => void,
  onError: (error: Error) => void,
): () => void {
  return subscribeTo<Todo>(
    groupId,
    'todos',
    (id, data) => ({
      id: id,
      groupId: groupId,
      text: String(data.text ?? ''),
      done: Boolean(data.done),
      assignedTo: typeof data.assignedTo === 'string' ? data.assignedTo : null,
      createdBy: String(data.createdBy ?? ''),
      createdAt: Number(data.createdAt ?? 0),
    }),
    onChange,
    onError,
  );
}

export async function saveTodo(todo: Todo): Promise<void> {
  await setDoc(doc(requireDb(), 'groups', todo.groupId, 'todos', todo.id), todo);
}

export async function deleteTodo(groupId: string, todoId: string): Promise<void> {
  await deleteDoc(doc(requireDb(), 'groups', groupId, 'todos', todoId));
}

export function subscribeToQuestions(
  groupId: string,
  onChange: (questions: DailyQuestion[]) => void,
  onError: (error: Error) => void,
): () => void {
  return subscribeTo<DailyQuestion>(
    groupId,
    'questions',
    (id, data) => {
      const rawAnswers = (data.answers ?? {}) as Record<string, Record<string, unknown>>;
      const answers: DailyQuestion['answers'] = {};

      for (const [uid, answer] of Object.entries(rawAnswers)) {
        answers[uid] = {
          text: String(answer.text ?? ''),
          memoryUri: typeof answer.memoryUri === 'string' ? answer.memoryUri : null,
          at: Number(answer.at ?? 0),
        };
      }

      return {
        id: id,
        groupId: groupId,
        date: String(data.date ?? ''),
        prompt: String(data.prompt ?? ''),
        askedBy: typeof data.askedBy === 'string' ? data.askedBy : null,
        answers: answers,
      };
    },
    onChange,
    onError,
  );
}

export async function saveQuestion(question: DailyQuestion): Promise<void> {
  await setDoc(doc(requireDb(), 'groups', question.groupId, 'questions', question.id), question);
}

export function subscribeToExpenses(
  groupId: string,
  onChange: (expenses: Expense[]) => void,
  onError: (error: Error) => void,
): () => void {
  return subscribeTo<Expense>(
    groupId,
    'expenses',
    (id, data) => ({
      id: id,
      groupId: groupId,
      title: String(data.title ?? ''),
      amountCents: Number(data.amountCents ?? 0),
      paidBy: String(data.paidBy ?? ''),
      splitAmong: Array.isArray(data.splitAmong) ? data.splitAmong.map(String) : [],
      createdAt: Number(data.createdAt ?? 0),
    }),
    onChange,
    onError,
  );
}

export async function saveExpense(expense: Expense): Promise<void> {
  await setDoc(doc(requireDb(), 'groups', expense.groupId, 'expenses', expense.id), expense);
}

export async function deleteExpense(groupId: string, expenseId: string): Promise<void> {
  await deleteDoc(doc(requireDb(), 'groups', groupId, 'expenses', expenseId));
}
