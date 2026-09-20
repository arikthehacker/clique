/**
 * ==============================
 * FILE: src/context/PlanningContext.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * The planning tools inside a group: polls, the shared to-do list, the
 * daily question, and expenses, shared by the chat room and the home tab.
 *
 * Includes:
 * - Polls: create, vote, close
 * - To-dos: add, check off, remove
 * - Daily question: ask your own, answer
 * - Expenses: add, remove
 *
 * Notes:
 * - Demo mode keeps flat lists in AsyncStorage.
 * - Firebase mode subscribes to a group the first time a screen asks for it.
 * - Voting and the daily prompts live in src/lib/polls.ts and src/lib/prompts.ts.
 */

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { isFirebaseConfigured } from '../firebase/firebaseConfig';
import * as planningService from '../firebase/planningService';
import {
  buildPoll,
  castVote,
} from '../lib/polls';
import { promptFor } from '../lib/prompts';
import {
  loadJson,
  saveJson,
  STORAGE_KEYS,
} from '../lib/storage';
import {
  DailyQuestion,
  Expense,
  Poll,
  Todo,
} from '../types';
import { useAuth } from './AuthContext';

type PlanningCtx = {
  pollsFor: (groupId: string) => Poll[];
  createPoll: (groupId: string, question: string, options: string[]) => Promise<Poll | string>;
  vote: (pollId: string, optionId: string) => Promise<void>;
  closePoll: (pollId: string) => Promise<void>;
  todosFor: (groupId: string) => Todo[];
  addTodo: (groupId: string, text: string, assignedTo: string | null) => Promise<void>;
  toggleTodo: (todoId: string) => Promise<void>;
  removeTodo: (todoId: string) => Promise<void>;
  questionFor: (groupId: string, date: string) => DailyQuestion;
  askQuestion: (groupId: string, date: string, prompt: string) => Promise<void>;
  answerQuestion: (groupId: string, date: string, text: string, memoryUri: string | null) => Promise<void>;
  expensesFor: (groupId: string) => Expense[];
  addExpense: (groupId: string, title: string, amountCents: number, paidBy: string, splitAmong: string[]) => Promise<void>;
  removeExpense: (expenseId: string) => Promise<void>;
};

// the day's built-in question, before anyone asks their own
function defaultQuestion(groupId: string, date: string): DailyQuestion {
  return {
    id: `${groupId}-${date}`,
    groupId: groupId,
    date: date,
    prompt: promptFor(date, groupId),
    askedBy: null,
    answers: {},
  };
}

const PlanningContext = createContext<PlanningCtx>({
  pollsFor: () => [],
  createPoll: async () => 'not ready',
  vote: async () => {},
  closePoll: async () => {},
  todosFor: () => [],
  addTodo: async () => {},
  toggleTodo: async () => {},
  removeTodo: async () => {},
  questionFor: defaultQuestion,
  askQuestion: async () => {},
  answerQuestion: async () => {},
  expensesFor: () => [],
  addExpense: async () => {},
  removeExpense: async () => {},
});

function replaceGroup<T extends { groupId: string }>(items: T[], groupId: string, incoming: T[]): T[] {
  return [
    ...items.filter((item) => item.groupId !== groupId),
    ...incoming,
  ];
}

export function PlanningProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const uid = user?.uid ?? null;

  const [
    polls,
    setPolls,
  ] = useState<Poll[]>([]);

  const [
    todos,
    setTodos,
  ] = useState<Todo[]>([]);

  const [
    questions,
    setQuestions,
  ] = useState<DailyQuestion[]>([]);

  const [
    expenses,
    setExpenses,
  ] = useState<Expense[]>([]);

  const unsubs = useRef<Record<string, (() => void)[]>>({});

  useEffect(() => {
    if (!uid || isFirebaseConfigured) {
      return;
    }

    Promise.all([
      loadJson<Poll[]>(STORAGE_KEYS.polls, []),
      loadJson<Todo[]>(STORAGE_KEYS.todos, []),
      loadJson<DailyQuestion[]>(STORAGE_KEYS.questions, []),
      loadJson<Expense[]>(STORAGE_KEYS.expenses, []),
    ]).then(([savedPolls, savedTodos, savedQuestions, savedExpenses]) => {
      setPolls(savedPolls);
      setTodos(savedTodos);
      setQuestions(savedQuestions);
      setExpenses(savedExpenses);
    });
  }, [uid]);

  // drops the group subscriptions when the account changes
  useEffect(() => {
    const current = unsubs.current;

    return () => {
      for (const groupId of Object.keys(current)) {
        current[groupId].forEach((unsubscribe) => unsubscribe());
        delete current[groupId];
      }
    };
  }, [uid]);

  const subscribeIfNeeded = useCallback((groupId: string) => {
    if (!uid || !isFirebaseConfigured || unsubs.current[groupId]) {
      return;
    }

    const ignoreError = () => {};

    unsubs.current[groupId] = [
      planningService.subscribeToPolls(groupId, (incoming) => setPolls((prev) => replaceGroup(prev, groupId, incoming)), ignoreError),
      planningService.subscribeToTodos(groupId, (incoming) => setTodos((prev) => replaceGroup(prev, groupId, incoming)), ignoreError),
      planningService.subscribeToQuestions(groupId, (incoming) => setQuestions((prev) => replaceGroup(prev, groupId, incoming)), ignoreError),
      planningService.subscribeToExpenses(groupId, (incoming) => setExpenses((prev) => replaceGroup(prev, groupId, incoming)), ignoreError),
    ];
  }, [uid]);

  const savePolls = useCallback(async (next: Poll[]) => {
    setPolls(next);
    await saveJson(STORAGE_KEYS.polls, next);
  }, []);

  const pollsFor = useCallback(
    (groupId: string) => {
      subscribeIfNeeded(groupId);

      return polls
        .filter((poll) => poll.groupId === groupId)
        .sort((a, b) => a.createdAt - b.createdAt);
    },
    [
      polls,
      subscribeIfNeeded,
    ],
  );

  const createPoll = useCallback(
    async (groupId: string, question: string, options: string[]) => {
      if (!user) {
        return 'Sign in first.';
      }

      const built = buildPoll(groupId, question, options, user.uid, Date.now());

      if (typeof built === 'string') {
        return built;
      }

      if (isFirebaseConfigured) {
        await planningService.savePoll(built);
      } else {
        await savePolls([
          ...polls,
          built,
        ]);
      }

      return built;
    },
    [
      user,
      polls,
      savePolls,
    ],
  );

  const updatePoll = useCallback(
    async (pollId: string, change: (poll: Poll) => Poll) => {
      const current = polls.find((poll) => poll.id === pollId);

      if (!current) {
        return;
      }

      const next = change(current);

      if (isFirebaseConfigured) {
        await planningService.savePoll(next);
        return;
      }

      await savePolls(polls.map((poll) => (poll.id === pollId ? next : poll)));
    },
    [
      polls,
      savePolls,
    ],
  );

  const vote = useCallback(
    async (pollId: string, optionId: string) => {
      if (!user) {
        return;
      }

      await updatePoll(pollId, (poll) => castVote(poll, optionId, user.uid));
    },
    [
      user,
      updatePoll,
    ],
  );

  const closePoll = useCallback(
    async (pollId: string) => {
      await updatePoll(pollId, (poll) => ({
        ...poll,
        closed: true,
      }));
    },
    [updatePoll],
  );

  const saveTodos = useCallback(async (next: Todo[]) => {
    setTodos(next);
    await saveJson(STORAGE_KEYS.todos, next);
  }, []);

  const todosFor = useCallback(
    (groupId: string) => {
      subscribeIfNeeded(groupId);

      // open ones first, then done
      return todos
        .filter((todo) => todo.groupId === groupId)
        .sort((a, b) => Number(a.done) - Number(b.done) || a.createdAt - b.createdAt);
    },
    [
      todos,
      subscribeIfNeeded,
    ],
  );

  const addTodo = useCallback(
    async (groupId: string, text: string, assignedTo: string | null) => {
      const clean = text.trim();

      if (!user || !clean) {
        return;
      }

      const todo: Todo = {
        id: Date.now().toString(),
        groupId: groupId,
        text: clean,
        done: false,
        assignedTo: assignedTo,
        createdBy: user.uid,
        createdAt: Date.now(),
      };

      if (isFirebaseConfigured) {
        await planningService.saveTodo(todo);
        return;
      }

      await saveTodos([
        ...todos,
        todo,
      ]);
    },
    [
      user,
      todos,
      saveTodos,
    ],
  );

  const toggleTodo = useCallback(
    async (todoId: string) => {
      const current = todos.find((todo) => todo.id === todoId);

      if (!current) {
        return;
      }

      const next = {
        ...current,
        done: !current.done,
      };

      if (isFirebaseConfigured) {
        await planningService.saveTodo(next);
        return;
      }

      await saveTodos(todos.map((todo) => (todo.id === todoId ? next : todo)));
    },
    [
      todos,
      saveTodos,
    ],
  );

  const removeTodo = useCallback(
    async (todoId: string) => {
      const current = todos.find((todo) => todo.id === todoId);

      if (!current) {
        return;
      }

      if (isFirebaseConfigured) {
        await planningService.deleteTodo(current.groupId, todoId);
        return;
      }

      await saveTodos(todos.filter((todo) => todo.id !== todoId));
    },
    [
      todos,
      saveTodos,
    ],
  );

  const questionFor = useCallback(
    (groupId: string, date: string): DailyQuestion => {
      subscribeIfNeeded(groupId);

      const fallback = defaultQuestion(groupId, date);

      return questions.find((question) => question.id === fallback.id) ?? fallback;
    },
    [
      questions,
      subscribeIfNeeded,
    ],
  );

  const saveQuestion = useCallback(
    async (next: DailyQuestion) => {
      if (isFirebaseConfigured) {
        await planningService.saveQuestion(next);
        return;
      }

      const nextQuestions = [
        ...questions.filter((question) => question.id !== next.id),
        next,
      ];

      setQuestions(nextQuestions);
      await saveJson(STORAGE_KEYS.questions, nextQuestions);
    },
    [questions],
  );

  const askQuestion = useCallback(
    async (groupId: string, date: string, prompt: string) => {
      const clean = prompt.trim();

      if (!user || !clean) {
        return;
      }

      // a new question clears the old answers
      await saveQuestion({
        ...questionFor(groupId, date),
        prompt: clean,
        askedBy: user.uid,
        answers: {},
      });
    },
    [
      user,
      questionFor,
      saveQuestion,
    ],
  );

  const answerQuestion = useCallback(
    async (groupId: string, date: string, text: string, memoryUri: string | null) => {
      const clean = text.trim();

      if (!user || (!clean && !memoryUri)) {
        return;
      }

      const current = questionFor(groupId, date);

      await saveQuestion({
        ...current,
        answers: {
          ...current.answers,
          [user.uid]: {
            text: clean,
            memoryUri: memoryUri,
            at: Date.now(),
          },
        },
      });
    },
    [
      user,
      questionFor,
      saveQuestion,
    ],
  );

  const saveExpenses = useCallback(async (next: Expense[]) => {
    setExpenses(next);
    await saveJson(STORAGE_KEYS.expenses, next);
  }, []);

  const expensesFor = useCallback(
    (groupId: string) => {
      subscribeIfNeeded(groupId);

      return expenses
        .filter((expense) => expense.groupId === groupId)
        .sort((a, b) => b.createdAt - a.createdAt);
    },
    [
      expenses,
      subscribeIfNeeded,
    ],
  );

  const addExpense = useCallback(
    async (groupId: string, title: string, amountCents: number, paidBy: string, splitAmong: string[]) => {
      const clean = title.trim();

      if (!user || !clean || amountCents <= 0) {
        return;
      }

      const expense: Expense = {
        id: Date.now().toString(),
        groupId: groupId,
        title: clean,
        amountCents: amountCents,
        paidBy: paidBy,
        splitAmong: splitAmong,
        createdAt: Date.now(),
      };

      if (isFirebaseConfigured) {
        await planningService.saveExpense(expense);
        return;
      }

      await saveExpenses([
        ...expenses,
        expense,
      ]);
    },
    [
      user,
      expenses,
      saveExpenses,
    ],
  );

  const removeExpense = useCallback(
    async (expenseId: string) => {
      const current = expenses.find((expense) => expense.id === expenseId);

      if (!current) {
        return;
      }

      if (isFirebaseConfigured) {
        await planningService.deleteExpense(current.groupId, expenseId);
        return;
      }

      await saveExpenses(expenses.filter((expense) => expense.id !== expenseId));
    },
    [
      expenses,
      saveExpenses,
    ],
  );

  const value = useMemo(
    () => ({
      pollsFor: pollsFor,
      createPoll: createPoll,
      vote: vote,
      closePoll: closePoll,
      todosFor: todosFor,
      addTodo: addTodo,
      toggleTodo: toggleTodo,
      removeTodo: removeTodo,
      questionFor: questionFor,
      askQuestion: askQuestion,
      answerQuestion: answerQuestion,
      expensesFor: expensesFor,
      addExpense: addExpense,
      removeExpense: removeExpense,
    }),
    [
      pollsFor,
      createPoll,
      vote,
      closePoll,
      todosFor,
      addTodo,
      toggleTodo,
      removeTodo,
      questionFor,
      askQuestion,
      answerQuestion,
      expensesFor,
      addExpense,
      removeExpense,
    ],
  );

  return (
    <PlanningContext.Provider value={value}>
      {children}
    </PlanningContext.Provider>
  );
}

export function usePlanning() {
  return useContext(PlanningContext);
}
