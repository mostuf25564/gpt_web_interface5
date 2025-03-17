import { UserRequest } from "./userRequest";

export interface AppState {
  userRequest: UserRequest; // The user request object
  isLoading: boolean; // Loading state
  error: string | null; // Error message
}
