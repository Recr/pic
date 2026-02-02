interface InputProps {
  label: string
  type: string
}

const Input: React.FC<InputProps> = ({ label, type }) => {
  return (
    <>
      <label>{label}</label>
      <input className="bg-white" type={type} />
    </>
  )
}

export default Input
