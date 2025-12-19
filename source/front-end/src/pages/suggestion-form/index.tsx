import { useState } from 'react'
import type { FormEvent } from 'react'
import logo from '../../assets/logo.png'
import { improvementAPI } from '../../store/improvement/improvement-api'
import { employeeAPI } from '../../store/employee/employee-api'
import { areaAPI } from '../../store/area/area-api'

function SuggestionForm() {
    const [employeeCount, setEmployeeCount] = useState(1);
    const [selectedEmployees, setSelectedEmployees] = useState<Record<number, { name: string; shift: string }>>({});
    const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
    const [createImprovement, { isLoading, isSuccess, isError }] = improvementAPI.useCreateImprovementMutation();
    
    // These queries can be used for autocomplete - pass search terms as needed
    const { data: employees } = employeeAPI.useGetEmployeesQuery();
    const { data: areas } = areaAPI.useGetAreasQuery();

    const handleEmployeeSelect = (num: number, re: string) => {
        const reNumber = Number(re);
        const selectedEmployee = employees?.find(emp => emp.re === reNumber);
        if (selectedEmployee) {
            setSelectedEmployees(prev => ({
                ...prev,
                [num]: {
                    name: selectedEmployee.name,
                    shift: selectedEmployee.shift || ''
                }
            }));
        }
    };

    const handleAreaSelect = (areaName: string) => {
        const selectedArea = areas?.find(area => area.name === areaName);
        if (selectedArea) {
            setSelectedAreaId(selectedArea.id);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        // Collect employee data
        const employeesList = [];
        for (let i = 1; i <= employeeCount; i++) {
            employeesList.push({
                re: Number(formData.get(`re-${i}`)),
                name: formData.get(`name-${i}`) as string,
                shift: formData.get(`shift-${i}`) as string,
            });
        }

        if (!selectedAreaId) {
            alert('Por favor, selecione uma área válida da lista.');
            return;
        }

        try {
            await createImprovement({
                employees: employeesList,
                areaId: selectedAreaId,
                description: formData.get('description') as string,
                date: new Date(),
            }).unwrap();
            
            // Reset form on success
            e.currentTarget.reset();
            setSelectedAreaId(null);
            setSelectedEmployees({});
            alert('Sugestão enviada com sucesso!');
        } catch (error) {
            console.log('Erro ao enviar sugestão:', error);
        }
    };

    return (
        <div>
            {/* header */}
            <header className='flex flex-col items-center mt-8'>
                <img
                    id="logo"
                    src={logo}
                    alt="Logo"
                    className='object-contain w-90 max-w-[400px] mb-5 border-[5px] border-[#ccc] rounded-[20px]'
                />
            </header>

            {/* main */}
            <main className='flex justify-center'>
                <form onSubmit={handleSubmit} className='flex flex-col items-center w-90 sm:w-auto shadow-custom py-5 px-[30px] mx-auto mb-[30px] rounded-[20px]'>
                    {/* employee_amount_radio */}
                    <div id="employee_amount_radio" className='my-8 mx-auto flex flex-col items-center'>
                        <label>Quantidade de Funcionários:</label>
                        <div className='flex justify-center gap-2.5'>
                            <input 
                                type="radio" 
                                id="radio1" 
                                name="employeeAmount" 
                                value="1" 
                                checked={employeeCount === 1}
                                onChange={() => setEmployeeCount(1)}
                                required 
                                className='cursor-pointer w-5' 
                            />
                            <label htmlFor="radio1">1</label>
                            <input 
                                type="radio" 
                                id="radio2" 
                                name="employeeAmount" 
                                value="2" 
                                checked={employeeCount === 2}
                                onChange={() => setEmployeeCount(2)}
                                className='cursor-pointer w-5' 
                            />
                            <label htmlFor="radio2">2</label>
                            <input 
                                type="radio" 
                                id="radio3" 
                                name="employeeAmount" 
                                value="3" 
                                checked={employeeCount === 3}
                                onChange={() => setEmployeeCount(3)}
                                className='cursor-pointer w-5' 
                            />
                            <label htmlFor="radio3">3</label>
                        </div>
                    </div>

                    {/* employee_information */}
                    <div id="employee_information" className='flex flex-col md:flex-row items-center gap-5 w-full mb-[30px] md:max-w-[700px] md:justify-center'>
                        {Array.from({ length: employeeCount }, (_, i) => i + 1).map((num) => (
                            <div key={num} className="employee_block flex flex-col items-center w-full md:min-w-[200px]">
                                <h4>Funcionário {num}</h4>
                                <label>RE:</label>
                                <input
                                    type="text"
                                    name={`re-${num}`}
                                    placeholder="Pesquisar por RE ou nome"
                                    list={`employees-list-${num}`}
                                    required
                                    className='w-4/5 p-2.5 my-1.5 rounded-[5px] border border-[#ccc]'
                                    onChange={(e) => handleEmployeeSelect(num, e.target.value)}
                                    onBlur={(e) => handleEmployeeSelect(num, e.target.value)}
                                />
                                <datalist id={`employees-list-${num}`}>
                                    {employees?.map((emp) => (
                                        <option key={emp.re} value={emp.re}>
                                            {emp.name}
                                        </option>
                                    ))}
                                </datalist>
                                {/* TODO: Allow to manually fill name and shift if not found in datalist*/}
                                <label>Nome:</label>
                                <input
                                    type="text"
                                    name={`name-${num}`}
                                    value={selectedEmployees[num]?.name || ''}
                                    onChange={(e) => setSelectedEmployees(prev => ({
                                        ...prev,
                                        [num]: { ...prev[num], name: e.target.value }
                                    }))}
                                    required
                                    className='w-4/5 p-2.5 my-1.5 rounded-[5px] border border-[#ccc]'
                                    readOnly
                                />

                                <label>Turno:</label>
                                <input
                                    type="text"
                                    name={`shift-${num}`}
                                    value={selectedEmployees[num]?.shift || ''}
                                    onChange={(e) => setSelectedEmployees(prev => ({
                                        ...prev,
                                        [num]: { ...prev[num], shift: e.target.value }
                                    }))}
                                    required
                                    className='employee_shift cursor-pointer w-4/5 p-2.5 my-1.5 rounded-[5px] border border-[#ccc]'
                                    readOnly
                                />
                            </div>
                        ))}
                    </div>

                    {/* suggestion_area */}
                    <div id="suggestion_area" className='flex flex-col gap-1.5 justify-center items-center w-90'>
                        <label>Local:</label>
                        <input
                            type="text"
                            name="area"
                            placeholder="Pesquisar área"
                            list="areas-list"
                            onChange={(e) => handleAreaSelect(e.target.value)}
                            required
                            className='w-4/5 p-2.5 my-1.5 rounded-[5px] border border-[#ccc]'
                        />
                        <datalist id="areas-list">
                            {areas?.map((area, index) => (
                                <option key={index} value={area.name}>
                                    {area.name}
                                </option>
                            ))}
                        </datalist>
                    </div>

                    <label>Sugestão:</label>
                    <textarea
                        id="description"
                        name="description"
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