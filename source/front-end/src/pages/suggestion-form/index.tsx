import { useState } from 'react'
import type { FormEvent } from 'react'
import logo from '../../assets/logo.png'
// import { useCreateImprovementMutation } from '../../store/improvement-api'
// import { useGetEmployeesQuery } from '../../store/employee-api'
// import { useGetAreasQuery } from '../../store/area-api'
import RadioGroup from './components/RadioGroup';

function SuggestionForm() {
    const [employeeCount, setEmployeeCount] = useState(1);
    
    // const [createImprovement, { isLoading, isSuccess, isError }] = useCreateImprovementMutation();
    
    // Handle RE input change to auto-fill name and shift
    const handleReChange = (employeeNum: number, value: string) => {
        const employee = employees?.find(emp => emp.re === value);
        if (employee) {
            const nameInput = document.querySelector(`input[name="name-${employeeNum}"]`) as HTMLInputElement;
            const shiftInput = document.querySelector(`input[name="shift-${employeeNum}"]`) as HTMLInputElement;
            
            if (nameInput) nameInput.value = employee.name;
            if (shiftInput) shiftInput.value = employee.shift;
        }
    };

    // Mock data for testing without database
    const isLoading = false;
    const isSuccess = false;
    const isError = false;

    // These queries can be used for autocomplete - pass search terms as needed
    // const { data: employees } = useGetEmployeesQuery();
    // const { data: areas } = useGetAreasQuery();
    
    // Mock employees data
    const employees = [
        { re: '12345', name: 'João Silva', shift: '1' },
        { re: '23456', name: 'Maria Santos', shift: '2' },
        { re: '34567', name: 'Pedro Oliveira', shift: '3' },
        { re: '45678', name: 'Ana Costa', shift: 'ADM' },
    ];

    // Mock areas data
    const areas = [
        { id: 1, name: 'Produção' },
        { id: 2, name: 'Qualidade' },
        { id: 3, name: 'Logística' },
        { id: 4, name: 'Manutenção' },
        { id: 5, name: 'Administração' },
    ];
    
    console.log(areas);


    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        // Collect employee data
        const employeesList = [];
        for (let i = 1; i <= employeeCount; i++) {
            employeesList.push({
                re: formData.get(`re-${i}`) as string,
                name: formData.get(`name-${i}`) as string,
                shift: formData.get(`shift-${i}`) as string,
            });
        }

        // Mock submission - log data instead of sending to API
        console.log('Form submission (mock):', {
            employees: employeesList,
            area: formData.get('area') as string,
            suggestion: formData.get('suggestion') as string,
        });

        // Reset form on success
        e.currentTarget.reset();
        alert('Sugestão enviada com sucesso! (mock)');

        /* Uncomment when database is available:
        try {
            await createImprovement({
                employees: employeesList,
                area: formData.get('area') as string,
                suggestion: formData.get('suggestion') as string,
            }).unwrap();

            // Reset form on success
            e.currentTarget.reset();
            alert('Sugestão enviada com sucesso!');
        } catch (error) {
            console.error('Erro ao enviar sugestão:', error);
            alert('Erro ao enviar sugestão. Tente novamente.');
        }
        */
    };

    return (
        <div className='mt-10'>
            <main className='flex justify-center'>
                <form onSubmit={handleSubmit} className='flex flex-col items-center w-90 sm:w-auto py-5 px-[30px] mx-auto mb-[30px] rounded-[20px] shadow-2xl'>
                    <img src={logo} alt="Logo Pic" className='w-80 rounded-2xl' />
                    <div className='my-8 mx-auto flex flex-col items-center'>
                        <label>Quantidade de Funcionários:</label>
                        <RadioGroup employeeCount={employeeCount} setEmployeeCount={setEmployeeCount} />
                    </div>

                    <div className='flex flex-col md:flex-row items-center gap-5 w-full mb-[30px] md:max-w-[700px] md:justify-center'>
                        {Array.from({ length: employeeCount }, (_, i) => i + 1).map((num) => (
                            <div key={num} className="employee_block flex flex-col items-center w-full md:min-w-[200px]">
                                <h4>Funcionário {num}</h4>
                                <label>RE:</label>
                                <input
                                    type="text"
                                    name={`re-${num}`}
                                    placeholder="Pesquisar por RE ou nome"
                                    list={`employees-list-${num}`}
                                    onChange={(e) => handleReChange(num, e.target.value)}
                                    required
                                    className='w-4/5 p-2.5 my-1.5 rounded-[5px] border border-[#ccc]'
                                />
                                <datalist id={`employees-list-${num}`}>
                                    {employees?.map((emp) => (
                                        <option key={emp.re} value={emp.re}>
                                            {emp.name} - Turno: {emp.shift}
                                        </option>
                                    ))}
                                </datalist>

                                <label>Nome:</label>
                                <input
                                    type="text"
                                    name={`name-${num}`}
                                    required
                                    className='w-4/5 p-2.5 my-1.5 rounded-[5px] border border-[#ccc]'
                                    readOnly
                                />

                                <label>Turno:</label>
                                <input
                                    type="text"
                                    name={`shift-${num}`}
                                    required
                                    className='employee_shift cursor-pointer w-4/5 p-2.5 my-1.5 rounded-[5px] border border-[#ccc]'
                                    readOnly
                                />
                            </div>
                        ))}
                    </div>

                    {/* suggestion_area */}
                    <div id="suggestion_area" className='flex gap-1.5 justify-center items-center w-90'>
                        <label>Local:</label>
                        <select
                            name="area"
                            required
                            className='w-4/5 p-2.5 my-1.5 rounded-[5px] border border-[#ccc] cursor-pointer'
                        >
                            <option value="">Selecione uma área</option>
                            {areas?.map((area) => (
                                <option key={area.id} value={area.id}>
                                    {area.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <label>Sugestão:</label>
                    <textarea
                        id="suggestion"
                        name="suggestion"
                        required
                        className='resize-none no-underline w-4/5 p-2.5 my-1.5 rounded-[5px] border border-[#ccc]'
                    ></textarea>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className='w-4/5 p-2.5 my-5 rounded-[5px] text-lg border-none bg-[#b90f0f] text-white cursor-pointer transition-all duration-500 hover:bg-[#610707] disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {isLoading ? 'Enviando...' : 'Enviar Sugestão'}
                    </button>

                    {isSuccess && (
                        <p className='text-green-600 text-center'>Sugestão enviada com sucesso!</p>
                    )}

                    {isError && (
                        <p className='text-red-600 text-center'>Erro ao enviar sugestão. Tente novamente.</p>
                    )}
                </form>
            </main>
        </div>
    )
}
export default SuggestionForm