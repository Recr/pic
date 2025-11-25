import { useState, useEffect } from 'react';
import { useGetEmployeesQuery } from '../../store/employee-api';
import { useGetAreasQuery } from '../../store/area-api';
// import { useGetCategoriesQuery } from '../../store/category-api'; // Uncomment when available
// import { useGetImprovementsWithDetailsQuery, useUpdateImprovementMutation } from '../../store/improvement-api'; // Uncomment when available

interface Improvement {
    id: number;
    status: string;
    description: string;
    employeeRes: string;
    employeeNames: string;
    employeeShifts: string;
    areaName?: string;
    categoryName?: string;
    managerName?: string;
}

interface UpdateData {
    managerRe: string;
    status: string;
    adminReviewedAt: string;
    areaId?: number;
    categoryId?: number;
}

function DefineManager() {
    const [improvements, setImprovements] = useState<Improvement[]>([]);
    
    // API Queries - uncomment when ready
    const { data: employees } = useGetEmployeesQuery();
    const { data: areas } = useGetAreasQuery();
    // const { data: categories } = useGetCategoriesQuery();
    // const { data: improvementsData } = useGetImprovementsWithDetailsQuery();
    // const [updateImprovement] = useUpdateImprovementMutation();

    // Mock data for development
    const categories = [
        { id: 1, name: 'Segurança', category_reward: 100 },
        { id: 2, name: 'Qualidade', category_reward: 150 },
        { id: 3, name: 'Produtividade', category_reward: 200 },
    ];



    useEffect(() => {
        // Use mock data for now
        const mockData: Improvement[] = [
            {
                id: 1,
                status: 'DEFINE_MANAGER',
                description: 'Sugestão de melhoria na linha de produção',
                employeeRes: '12345, 23456',
                employeeNames: 'João Silva, Maria Santos',
                employeeShifts: '1, 2',
                areaName: undefined,
                categoryName: undefined,
                managerName: undefined,
            },
            {
                id: 2,
                status: 'DEFINE_MANAGER',
                description: 'Implementar novo processo de qualidade',
                employeeRes: '34567',
                employeeNames: 'Pedro Oliveira',
                employeeShifts: '3',
                areaName: undefined,
                categoryName: undefined,
                managerName: undefined,
            },
        ];
        setImprovements(mockData);
        
        // Uncomment when API is ready:
        // if (improvementsData?.improvements) {
        //     setImprovements(improvementsData.improvements.filter((imp: Improvement) => imp.status === 'DEFINE_MANAGER'));
        // }
    }, []);

    const getStatusClass = (status: string): string => {
        const statusMap: { [key: string]: string } = {
            'DEFINE_MANAGER': 'status-pending',
            'DEFINE_CHAMPION': 'status-in-progress',
            'REJECTED': 'status-rejected',
            'APPROVED': 'status-approved',
        };
        return statusMap[status] || 'status-default';
    };

    const translateStatus = (status: string): string => {
        const translations: { [key: string]: string } = {
            'DEFINE_MANAGER': 'Definir Gestor',
            'DEFINE_CHAMPION': 'Definir Campeão',
            'REJECTED': 'Rejeitada',
            'APPROVED': 'Aprovada',
        };
        return translations[status] || status;
    };

    const handleAreaChange = (improvementId: number, value: string) => {
        const area = areas?.find(a => a.name === value);
        if (area) {
            const input = document.getElementById(`area-input-${improvementId}`) as HTMLInputElement;
            if (input) input.dataset.selectedId = String(area.id);
        }
    };

    const handleCategoryChange = (improvementId: number, value: string) => {
        const category = categories?.find(c => c.name === value);
        if (category) {
            const input = document.getElementById(`category-input-${improvementId}`) as HTMLInputElement;
            if (input) input.dataset.selectedId = String(category.id);
        }
    };

    const handleManagerChange = (improvementId: number, value: string) => {
        const employee = employees?.find(emp => emp.name === value);
        if (employee) {
            const input = document.getElementById(`manager-input-${improvementId}`) as HTMLInputElement;
            if (input) input.dataset.selectedRe = employee.re;
        }
    };

    const setManager = async (improvementId: number) => {
        const managerInput = document.getElementById(`manager-input-${improvementId}`) as HTMLInputElement;
        const areaInput = document.getElementById(`area-input-${improvementId}`) as HTMLInputElement;
        const categoryInput = document.getElementById(`category-input-${improvementId}`) as HTMLInputElement;

        const managerName = managerInput?.value.trim();
        const managerRe = managerInput?.dataset.selectedRe;

        const areaId = areaInput?.dataset.selectedId;
        const categoryId = categoryInput?.dataset.selectedId;

        if (!managerName) {
            alert('Por favor, selecione um gestor da lista.');
            return;
        }

        if (!managerRe) {
            alert('Por favor, selecione um gestor válido da lista de sugestões.');
            return;
        }

        if (areaInput && !areaId) {
            alert('Por favor, selecione uma área válida da lista.');
            return;
        }

        if (categoryInput && !categoryId) {
            alert('Por favor, selecione uma categoria válida da lista.');
            return;
        }

        try {
            const updateData: UpdateData = {
                managerRe: managerRe,
                status: 'DEFINE_CHAMPION',
                adminReviewedAt: new Date().toISOString().split('T')[0]
            };

            if (areaId) updateData.areaId = parseInt(areaId);
            if (categoryId) updateData.categoryId = parseInt(categoryId);

            // Mock update
            console.log('Update data:', updateData);
            alert('Dados definidos com sucesso!');
            
            // Uncomment when API is ready:
            // await updateImprovement({ id: improvementId, ...updateData }).unwrap();
            // alert('Dados definidos com sucesso!');
        } catch (error) {
            console.error('Erro ao definir dados:', error);
            alert('Erro ao definir dados. Tente novamente.');
        }
    };

    const rejectSuggestion = async (improvementId: number) => {
        const userConfirmed = confirm('Tem certeza de que deseja rejeitar esta sugestão?');
        
        if (!userConfirmed) return;

        try {
            // Mock rejection
            console.log('Rejecting improvement:', improvementId);
            alert('Sugestão rejeitada com sucesso.');
            
            // Uncomment when API is ready:
            // await updateImprovement({ id: improvementId, status: 'REJECTED' }).unwrap();
            // alert('Sugestão rejeitada com sucesso.');
        } catch (error) {
            console.error('Erro ao rejeitar sugestão:', error);
            alert('Erro ao rejeitar sugestão. Tente novamente.');
        }
    };

    return (
        <div className="bg-[#eee] min-h-screen font-sans">
            <div className="flex justify-between items-center py-2.5 px-5 bg-white shadow-md mb-2.5">
                <h2 className="m-0 text-xl">Lista de Sugestões</h2>
            </div>

            <div className="px-2.5 mb-2.5">
                <button 
                    onClick={() => window.location.href = '/add-employee'}
                    className="py-2 px-3 cursor-pointer rounded border border-[#ccc] mr-2"
                >
                    Adicionar Funcionário
                </button>
                <button 
                    onClick={() => window.location.href = '/suggestion-list'}
                    className="py-2 px-3 cursor-pointer rounded border border-[#ccc] mr-2"
                >
                    Ver Sugestões
                </button>
                <button 
                    onClick={() => window.location.href = '/payout-list'}
                    className="py-2 px-3 cursor-pointer rounded border border-[#ccc]"
                >
                    Ver Pagamentos
                </button>
            </div>

            <div className="flex flex-wrap">
                {improvements.length === 0 ? (
                    <p className="px-2.5">Nenhuma sugestão encontrada.</p>
                ) : (
                    improvements.map((item) => {
                        const employeeRes = item.employeeRes.split(',').map(res => res.trim());
                        const employeeNames = item.employeeNames.split(',').map(name => name.trim());
                        const employeeShifts = item.employeeShifts ? item.employeeShifts.split(',').map(shift => shift.trim()) : [];

                        return (
                            <div 
                                key={item.id} 
                                className="border border-[#ccc] rounded-md p-4 m-2.5 w-[350px] bg-white flex flex-col"
                            >
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-lg m-0">Sugestão #{item.id}</h3>
                                        <div className={`${getStatusClass(item.status)} flex items-center gap-2`}>
                                            <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
                                            <span>{translateStatus(item.status)}</span>
                                        </div>
                                    </div>

                                    <p><strong>Área:</strong> {item.areaName || 'Não definida'}</p>
                                    <p><strong>Categoria:</strong> {item.categoryName || 'Não definida'}</p>
                                    
                                    <p><strong>Colaboradores:</strong></p>
                                    <ul className="ml-5">
                                        {employeeRes.map((re, i) => (
                                            <li key={i}>
                                                {employeeNames[i] || 'Desconhecido'} (RE: {re}) - Turno: {employeeShifts[i] || 'N/A'}
                                            </li>
                                        ))}
                                    </ul>

                                    <p>
                                        <strong>Sugestão:</strong><br />
                                        <span dangerouslySetInnerHTML={{ __html: item.description.replace(/\n/g, '<br>') }} />
                                    </p>
                                </div>

                                {!item.managerName ? (
                                    <div className="flex flex-col gap-2 items-start my-5 pt-2.5 border-t border-[#eee]">
                                        <label htmlFor={`area-input-${item.id}`}>
                                            <strong>Definir Área:</strong>
                                        </label>
                                        <input
                                            type="text"
                                            id={`area-input-${item.id}`}
                                            name="area"
                                            placeholder="Pesquisar área por nome"
                                            list={`areas-list-${item.id}`}
                                            onChange={(e) => handleAreaChange(item.id, e.target.value)}
                                            autoComplete="off"
                                            className="p-1.5 w-full border border-[#ccc] rounded"
                                        />
                                        <datalist id={`areas-list-${item.id}`}>
                                            {areas?.map((area) => (
                                                <option key={area.id} value={area.name}>
                                                    {area.name}
                                                </option>
                                            ))}
                                        </datalist>

                                        <label htmlFor={`category-input-${item.id}`}>
                                            <strong>Definir Categoria:</strong>
                                        </label>
                                        <input
                                            type="text"
                                            id={`category-input-${item.id}`}
                                            name="category"
                                            placeholder="Pesquisar categoria por nome"
                                            list={`categories-list-${item.id}`}
                                            onChange={(e) => handleCategoryChange(item.id, e.target.value)}
                                            autoComplete="off"
                                            className="p-1.5 w-full border border-[#ccc] rounded"
                                        />
                                        <datalist id={`categories-list-${item.id}`}>
                                            {categories?.map((category) => (
                                                <option key={category.id} value={category.name}>
                                                    Recompensa: R${Number(category.category_reward).toFixed(2)}
                                                </option>
                                            ))}
                                        </datalist>

                                        <label htmlFor={`manager-input-${item.id}`}>
                                            <strong>Definir Gestor:</strong>
                                        </label>
                                        <input
                                            type="text"
                                            id={`manager-input-${item.id}`}
                                            name="manager"
                                            placeholder="Pesquisar gestor por nome ou RE"
                                            list={`employees-list-${item.id}`}
                                            onChange={(e) => handleManagerChange(item.id, e.target.value)}
                                            autoComplete="off"
                                            className="p-1.5 w-full border border-[#ccc] rounded"
                                        />
                                        <datalist id={`employees-list-${item.id}`}>
                                            {employees?.map((emp) => (
                                                <option key={emp.re} value={emp.name}>
                                                    RE: {emp.re} - {emp.name}
                                                </option>
                                            ))}
                                        </datalist>

                                        <button
                                            onClick={() => setManager(item.id)}
                                            className="py-2 px-3 cursor-pointer rounded border border-[#ccc] bg-white"
                                        >
                                            Definir dados
                                        </button>
                                    </div>
                                ) : (
                                    <p><strong>Gestor:</strong> {item.managerName}</p>
                                )}

                                <div className="mt-auto flex gap-2.5">
                                    <button
                                        onClick={() => rejectSuggestion(item.id)}
                                        className="py-2 px-3 cursor-pointer rounded border border-[#c0392b] bg-[#e74c3c] text-white"
                                    >
                                        Rejeitar sugestão
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default DefineManager;