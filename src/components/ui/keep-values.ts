import { startTransition, type FormEvent } from "react";

/**
 * Submit a form to a useActionState action WITHOUT React's automatic reset of the fields.
 * (<form action={fn}> clears uncontrolled inputs after every submit, so a wrong password
 * or an unticked consent would wipe everything the person typed.)
 */
export function keepValues(action: (formData: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  };
}
