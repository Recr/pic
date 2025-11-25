interface RadioGroupProps {
    employeeCount: number;
    setEmployeeCount: (count: number) => void;
}


function RadioGroup(radioGroupProps: RadioGroupProps) {
    return (
        <div className='flex justify-center gap-2.5'>
            <input
                type="radio"
                id="radio1"
                name="employeeAmount"
                value="1"
                checked={radioGroupProps.employeeCount === 1}
                onChange={() => radioGroupProps.setEmployeeCount(1)}
                required
                className='cursor-pointer w-5'
            />
            <label htmlFor="radio1">1</label>
            <input
                type="radio"
                id="radio2"
                name="employeeAmount"
                value="2"
                checked={radioGroupProps.employeeCount === 2}
                onChange={() => radioGroupProps.setEmployeeCount(2)}
                className='cursor-pointer w-5'
            />
            <label htmlFor="radio2">2</label>
            <input
                type="radio"
                id="radio3"
                name="employeeAmount"
                value="3"
                checked={radioGroupProps.employeeCount === 3}
                onChange={() => radioGroupProps.setEmployeeCount(3)}
                className='cursor-pointer w-5'
            />
            <label htmlFor="radio3">3</label>
        </div>
    )
}

export default RadioGroup;