import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const styles = {
  error: 'bg-red-50 text-red-700 border-red-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  info: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const icons = { error: AlertCircle, success: CheckCircle, info: Info };

export default function Alert({ type = 'info', message }) {
  if (!message) return null;
  const Icon = icons[type];
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm ${styles[type]}`}>
      <Icon size={16} />
      <span>{message}</span>
    </div>
  );
}
