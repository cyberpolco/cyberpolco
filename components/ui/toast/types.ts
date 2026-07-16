export type ToastVariant = "info" | "success" | "error" | "warning";

export type Toast = {
  id: string;
  variant: ToastVariant;
  message: string;
  duration: number;
  exiting: boolean;
};

export type PushToastOptions = {
  variant?: ToastVariant;
  duration?: number;
};
