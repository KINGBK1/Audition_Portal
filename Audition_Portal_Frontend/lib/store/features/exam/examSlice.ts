import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/lib/store/store";
import axios from "axios";

interface Question {
  id: number;
  description: string;
  options: OptionTypes[];
  createdAt: string;
  updatedAt: string;
}

interface Answer {
  id: number;
  option: OptionTypes;
  description: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  questionId: number;
}

interface OptionTypes {
  A: string;
  B: string;
  C: string;
  D: string;
}

// Define a type for the slice state
interface IExamState {
  loading: boolean;
  question: Question | null;
  questions: Question[];
  answer: Answer | null;
  answers: Answer[];
  error: string | null;
  success: boolean;
}

// Define the initial state using that type
const initialState: IExamState = {
  loading: false,
  question: null,
  questions: [],
  answer: null,
  answers: [],
  error: null,
  success: false,
};

// Async thunk for fetching a question by ID
export const fetchQuestionById = createAsyncThunk(
  "exam/fetchQuestionById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/questions/${id}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for creating a new question
export const createQuestion = createAsyncThunk(
  "exam/createQuestion",
  async (questionData: { description: string; options: OptionTypes[] }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/create`,
        questionData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for submitting an answer
export const submitAnswer = createAsyncThunk(
  "exam/submitAnswer",
  async (answerData: { questionId: number; option: OptionTypes; description: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/answer`,
        answerData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const examSlice = createSlice({
  name: "exam",
  initialState,
  reducers: {
    clearExamState: (state) => {
      state.question = null;
      state.questions = [];
      state.answer = null;
      state.answers = [];
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Question by ID
      .addCase(fetchQuestionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestionById.fulfilled, (state, action: PayloadAction<Question>) => {
        state.loading = false;
        state.question = action.payload;
      })
      .addCase(fetchQuestionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Question
      .addCase(createQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuestion.fulfilled, (state, action: PayloadAction<Question>) => {
        state.loading = false;
        state.questions.push(action.payload);
      })
      .addCase(createQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Submit Answer
      .addCase(submitAnswer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAnswer.fulfilled, (state, action: PayloadAction<Answer>) => {
        state.loading = false;
        state.answers.push(action.payload);
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearExamState } = examSlice.actions;

export const selectExamState = (state: RootState) => state.exam;

export const examReducer = examSlice.reducer;
