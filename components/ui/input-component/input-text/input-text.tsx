import { Field, FieldLabel } from "../field-1";
import { Input } from "../input";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  fieldClassName?: string;
  labelClassName?: string;
}

const InputText = ({
  label,
  id,
  fieldClassName,
  labelClassName,
  type,
  ...inputProps
}: FormInputProps) => {
  return (
    <Field className={fieldClassName}>
      <FieldLabel htmlFor={id} className={labelClassName}>
        {label}
      </FieldLabel>

      <Input
        id={id}
        type={type}
        showPasswordToggle={type === "password"}
        {...inputProps}
      />
    </Field>
  );
};

export default InputText;
