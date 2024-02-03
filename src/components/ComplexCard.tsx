import { GoalData, ProjectData, TaskData } from "@/data/flatFakeData";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import EditProjectForm from "./EditProjectForm";
import TaskForm from "./TaskForm";
import TaskCard from "./TaskCard";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface ComplexCardProps {
    key: string,
    index: number,
    project: ProjectData,
    goalDataState: GoalData[],
    projectDataState: ProjectData[],
    setProjectDataState: React.Dispatch<React.SetStateAction<ProjectData[]>>,
    calcProjectScore: (project: ProjectData) => number,
    onMoveUp: () => void,
    onMoveDown: () => void,
}

const ComplexCard: React.FC<ComplexCardProps> = ({ project, index, goalDataState, projectDataState, setProjectDataState, calcProjectScore, onMoveUp, onMoveDown }) => {

    const moveTask = (currentIndex: number, direction: number) => {
        const newIndex = Math.max(0, Math.min(project.projectTasks.length - 1, currentIndex + direction))
        const updatedTaskData: TaskData[] = [...project.projectTasks]
        const tempTask = updatedTaskData[currentIndex]
        updatedTaskData[currentIndex] = updatedTaskData[newIndex]
        updatedTaskData[newIndex] = tempTask
        const taskId = updatedTaskData[0].taskId

        const findProjectIndexByTask = (taskId: string) => {
            const projectIndex = projectDataState.findIndex(project => 
                project.projectTasks.some(task => task.taskId === taskId)
            )
            return projectIndex
        }

       const projectIndex = findProjectIndexByTask(taskId)
        const updatedProjectData: ProjectData[] = [...projectDataState]
        updatedProjectData[projectIndex].projectTasks = updatedTaskData
        setProjectDataState(updatedProjectData)
    }

    const projectGoalColor = goalDataState.find((goal) => (goal.goalId === project.projectGoal))?.goalColor

    const background = projectGoalColor

    const activeTasks = project.projectTasks.filter((task) => task.taskStatus === "active").length
    const completedTasks = project.projectTasks.filter((task) => task.taskStatus === "completed").length

    return (
        <div className="w-64 rounded-2xl px-4 py-4" style={{ background }}>
            <div className="flex justify-between items-start">
                <h1 className="pb-4">{ project.projectDesc }</h1>
                <nav className="flex flex-col justify-between items-center gap-2">
                    <Button variant={"ghost"} className="p-0"  onClick={onMoveUp}> <ArrowUpIcon/> </Button>
                    <Button variant={"ghost"} className="p-0"  onClick={onMoveDown}> <ArrowDownIcon/> </Button>
                </nav>
            </div>
            <EditProjectForm 
                    project={project}
                    index={index}
                    goalDataState={goalDataState}
                    calcProjectScore={calcProjectScore}
                    projectDataState={projectDataState}
                    setProjectDataState={setProjectDataState}
                />
            <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                    <AccordionTrigger>tasks</AccordionTrigger>
                    <AccordionContent>
                        
                        <section className="flex flex-col gap-4">
                            <div className="flex justify-end items-center relative">
                                <TaskForm
                                    mode={"add"}
                                    taskProject={project.projectId}
                                    background={projectGoalColor}
                                    projectDataState={projectDataState}
                                    setProjectDataState={setProjectDataState}
                                />
                                <span className="text-xl font-bold text-center flex-grow w-full z-10 absolute">⚡ active ⚡</span>
                            </div>
                            {activeTasks > 0 ? 
                                project.projectTasks && project.projectTasks.filter(task => task.taskStatus === "active").map((task, index) => (
                                    <TaskCard
                                        key={task.taskId}
                                        task={task}
                                        taskProjectId={project.projectId}
                                        projectDataState={projectDataState}
                                        background={projectGoalColor}
                                        setProjectDataState={setProjectDataState}
                                        onTaskMoveUp={() => moveTask(index, -1)}
                                        onTaskMoveDown={() => moveTask(index, 1)}
                                    />
                                ))
                            : 
                                <span className="border-2 rounded-xl border-gray-300 p-2 text-center font-semibold">no active tasks</span>
                            }
                            
                        </section>
                        <section className="flex flex-col gap-4 py-4">
                            {completedTasks > 0 ? <span className="text-xl font-bold w-full text-center">🎉 completed 🎉</span> : ""}
                            {completedTasks > 0 ?
                                project.projectTasks && project.projectTasks
                                .filter(task => task.taskStatus === "completed")
                                .map((task, index) => (
                                    <TaskCard
                                        key={task.taskId}
                                        task={task}
                                        taskProjectId={project.projectId}
                                        projectDataState={projectDataState}
                                        background={projectGoalColor}
                                        setProjectDataState={setProjectDataState}
                                        onTaskMoveUp={() => moveTask(index, -1)}
                                        onTaskMoveDown={() => moveTask(index, 1)}
                                    />
                                ))
                            :
                            ""
                            }
                        </section>
                        
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

        </div>
    )
}



export default ComplexCard