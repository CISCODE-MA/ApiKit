import type { ButtonHTMLAttributes } from 'react';
import { useNoop } from '../hooks';

export type NoopButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function NoopButton(props: NoopButtonProps) {
  const onClick = useNoop();
  return <button type="button" {...props} onClick={onClick} />;
}
