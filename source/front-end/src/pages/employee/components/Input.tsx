interface InputProps {
  label: string
  type: string
}

function Input({ label, type }: InputProps) {
  return (
    <>
      <label>{label}</label>
      <input className="bg-white" type={type} />
    </>
  )
}

export default Input
