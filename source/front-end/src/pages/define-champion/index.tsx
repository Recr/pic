// import { useState, useEffect } from "react";
import { employeeAPI } from "../../store/employee/employee-api";
import { areaAPI } from "../../store/area/area-api";
import { proposalAPI } from "../../store/proposal/proposal-api";
import { categoryAPI } from "../../store/category/category-api";
import { translateStatus } from "../../helpers/translateStatus";
// import { useGetCategoriesQuery } from '../../store/category-api'; // Uncomment when available
// import { useGetImprovementsWithDetailsQuery, useUpdateImprovementMutation } from '../../store/improvement-api'; // Uncomment when available

interface ProposalWithEmployees {
  id: number;
  description: string;
  status: string;
  employeeRes: string;
  employeeNames: string;
  employeeShifts: string;
  areaName?: string;
  categoryName?: string;
  championName?: string;
}

interface UpdateData {
  championRe: string;
  status: string;
  adminReviewedAt: string;
  areaId?: number;
  categoryId?: number;
}

function DefineChampion() {
  const { data: employees } = employeeAPI.useGetEmployeesQuery();
  const { data: areas } = areaAPI.useGetAreasQuery();
  const { data: proposalsList } =
    proposalAPI.useGetProposalsWithEmployeesQuery();
  const { data: categories } = categoryAPI.useGetCategoriesQuery();

  // const getStatusClass = (status: string): string => {
  //   const statusMap: { [key: string]: string } = {
  //     DEFINE_MANAGER: "status-pending",
  //     DEFINE_CHAMPION: "status-in-progress",
  //     REJECTED: "status-rejected",
  //     APPROVED: "status-approved",
  //   };
  //   return statusMap[status] || "status-default";
  // };

  // const handleAreaChange = (improvementId: number, value: string) => {
  //   const area = areas?.find((a) => a.name === value);
  //   if (area) {
  //     const input = document.getElementById(
  //       `area-input-${improvementId}`,
  //     ) as HTMLInputElement;
  //     if (input) input.dataset.selectedId = String(area.id);
  //   }
  // };

  // const handleCategoryChange = (improvementId: number, value: string) => {
  //   const category = categories?.find((c) => c.name === value);
  //   if (category) {
  //     const input = document.getElementById(
  //       `category-input-${improvementId}`,
  //     ) as HTMLInputElement;
  //     if (input) input.dataset.selectedId = String(category.id);
  //   }
  // };

  // const handleChampionChange = (improvementId: number, value: string) => {
  //   const employee = employees?.find((emp) => emp.name === value);
  //   if (employee) {
  //     const input = document.getElementById(
  //       `champion-input-${improvementId}`,
  //     ) as HTMLInputElement;
  //     if (input) input.dataset.selectedRe = employee.re;
  //   }
  // };

  // const setChampion = async (improvementId: number) => {
  //   const championInput = document.getElementById(
  //     `champion-input-${improvementId}`,
  //   ) as HTMLInputElement;
  //   const areaInput = document.getElementById(
  //     `area-input-${improvementId}`,
  //   ) as HTMLInputElement;
  //   const categoryInput = document.getElementById(
  //     `category-input-${improvementId}`,
  //   ) as HTMLInputElement;

  //   const championName = championInput?.value.trim();
  //   const championRe = championInput?.dataset.selectedRe;

  //   const areaId = areaInput?.dataset.selectedId;
  //   const categoryId = categoryInput?.dataset.selectedId;

  //   if (!championName) {
  //     alert("Por favor, selecione um gestor da lista.");
  //     return;
  //   }

  //   if (!championRe) {
  //     alert("Por favor, selecione um gestor válido da lista de sugestões.");
  //     return;
  //   }

  //   if (areaInput && !areaId) {
  //     alert("Por favor, selecione uma área válida da lista.");
  //     return;
  //   }

  //   if (categoryInput && !categoryId) {
  //     alert("Por favor, selecione uma categoria válida da lista.");
  //     return;
  //   }

  //   try {
  //     const updateData: UpdateData = {
  //       championRe: championRe,
  //       status: "UNDER_VALIDATION",
  //       adminReviewedAt: new Date().toISOString().split("T")[0],
  //     };

  //     if (areaId) updateData.areaId = parseInt(areaId);
  //     if (categoryId) updateData.categoryId = parseInt(categoryId);

  //     // Mock update
  //     console.log("Update data:", updateData);
  //     alert("Dados definidos com sucesso!");

  //     // Uncomment when API is ready:
  //     // await updateImprovement({ id: improvementId, ...updateData }).unwrap();
  //     // alert('Dados definidos com sucesso!');
  //   } catch (error) {
  //     console.error("Erro ao definir dados:", error);
  //     alert("Erro ao definir dados. Tente novamente.");
  //   }
  // };

  // const rejectSuggestion = async (improvementId: number) => {
  //   const userConfirmed = confirm(
  //     "Tem certeza de que deseja rejeitar esta sugestão?",
  //   );

  //   if (!userConfirmed) return;

  //   try {
  //     // Mock rejection
  //     console.log("Rejecting improvement:", improvementId);
  //     alert("Sugestão rejeitada com sucesso.");

  //     // Uncomment when API is ready:
  //     // await updateImprovement({ id: improvementId, status: 'REJECTED' }).unwrap();
  //     // alert('Sugestão rejeitada com sucesso.');
  //   } catch (error) {
  //     console.error("Erro ao rejeitar sugestão:", error);
  //     alert("Erro ao rejeitar sugestão. Tente novamente.");
  //   }
  // };

  return (
    <div className="bg-[#eee] min-h-screen font-sans">
      <div className="flex justify-between items-center py-2.5 px-5 bg-white shadow-md mb-2.5">
        <h2 className="ml-8 text-xl">Lista de Sugestões</h2>
      </div>
      <div className="flex flex-wrap">
        {!proposalsList || proposalsList.length === 0 ? (
          <p className="px-2.5">Nenhuma sugestão encontrada.</p>
        ) : (
          proposalsList.map((proposal) => {
            // const employeeRes = proposal.employees
            //   .split(",")
            //   .map((res) => res.trim());
            // const employeeNames = proposal.employeeNames
            //   .split(",")
            //   .map((name) => name.trim());
            // const employeeShifts = proposal.employeeShifts
            //   ? proposal.employeeShifts.split(",").map((shift) => shift.trim())
            //   : [];
            return (
              <div
                key={proposal.id}
                className="border border-[#ccc] rounded-md p-4 m-2.5 w-[350px] bg-white flex flex-col"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg m-0">Sugestão #{proposal.id}</h3>
                    <div
                      className={`${translateStatus(proposal.status)} flex items-center gap-2`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
                      <span>{translateStatus(proposal.status)}</span>
                    </div>
                  </div>

                  {/* <p>
                    <strong>Área:</strong> {proposal.areaName || "Não definida"}
                  </p> */}
                  <p>
                    <strong>Colaboradores:</strong>
                  </p>
                  <ul className="ml-5">
                    {(() => {
                      console.log(proposal.employees);
                      return null;
                    })()}
                    {!proposal.employees ? (
                      <p>Nenhum colaborador encontrado</p>
                    ) : (
                      employees?.map((employee, i) => {
                        return (
                          <li key={i}>
                            {employee.name} (RE: {employee.re}) - Turno:{" "}
                            {employee.shift}
                          </li>
                        );
                      })
                    )}
                  </ul>

                  <p>
                    <strong>Sugestão:</strong>
                    <br />
                    <span>{proposal.description}</span>
                  </p>
                </div>

                <div className="flex flex-col gap-2 items-start my-5 pt-2.5 border-t border-[#eee]">
                  <label htmlFor={`area-input-${proposal.id}`}>
                    <strong>Definir Área:</strong>
                  </label>
                  <input
                    type="text"
                    id={`area-input-${proposal.id}`}
                    name="area"
                    placeholder="Pesquisar área por nome"
                    list={`areas-list-${proposal.id}`}
                    // onChange={(e) =>
                    //   handleAreaChange(proposal.id, e.target.value)
                    // }
                    autoComplete="off"
                    className="p-1.5 w-full border border-[#ccc] rounded"
                  />
                  <datalist id={`areas-list-${proposal.id}`}>
                    {areas?.map((area) => (
                      <option key={area.id} value={area.name}>
                        {area.name}
                      </option>
                    ))}
                  </datalist>

                  <label htmlFor={`category-input-${proposal.id}`}>
                    <strong>Definir Categoria:</strong>
                  </label>
                  <input
                    type="text"
                    id={`category-input-${proposal.id}`}
                    name="category"
                    placeholder="Pesquisar categoria por nome"
                    list={`categories-list-${proposal.id}`}
                    // onChange={(e) =>
                    //   handleCategoryChange(proposal.id, e.target.value)
                    // }
                    autoComplete="off"
                    className="p-1.5 w-full border border-[#ccc] rounded"
                  />
                  <datalist id={`categories-list-${proposal.id}`}>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.name}>
                        Recompensa: R$
                        {Number(category.categoryReward).toFixed(2)}
                      </option>
                    ))}
                  </datalist>

                  <label htmlFor={`champion-input-${proposal.id}`}>
                    <strong>Definir Champion:</strong>
                  </label>
                  <input
                    type="text"
                    id={`champion-input-${proposal.id}`}
                    name="champion"
                    placeholder="Pesquisar gestor por nome ou RE"
                    list={`employees-list-${proposal.id}`}
                    // onChange={(e) =>
                    //   handleChampionChange(proposal.id, e.target.value)
                    // }
                    autoComplete="off"
                    className="p-1.5 w-full border border-[#ccc] rounded"
                  />
                  <datalist id={`employees-list-${proposal.id}`}>
                    {employees?.map((emp) => (
                      <option key={emp.re} value={emp.name}>
                        RE: {emp.re} - {emp.name}
                      </option>
                    ))}
                  </datalist>

                  <button
                    // onClick={() => setChampion(proposal.id)}
                    className="py-2 px-3 cursor-pointer rounded border border-[#ccc] bg-white"
                  >
                    Definir dados
                  </button>
                </div>
                <div className="mt-auto flex gap-2.5">
                  <button
                    // onClick={() => rejectSuggestion(proposal.id)}
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

export default DefineChampion;
