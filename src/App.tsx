import { ThemeProvider } from "@/components/theme-provider"
import { GoalSection } from "./components/GoalSection"
import "./styles/globals.css"
import { ModeToggle } from "./components/mode-toggle"
import ProjectSection from "./components/ProjectSection"
import ResultsSection from "./components/ResultsSection"
import { useState } from "react"
import { GoalData, ProjectData, flatFakeData } from "./data/flatFakeData"

function App() {
  const [goalDataState, setGoalDataState] = useState(flatFakeData.goalData)
  const [ projectDataState, setProjectDataState ] = useState(flatFakeData.projectData)


  const processValue = (value: string) => {
    if(value === "low"){
      return 1
    }
    if(value === "medium") {
      return 2
    }
    if(value === "high") {
      return 3
    }
    else {
      return 2
    }
  }

  const calcGoalScore = (goal: GoalData) => {
      let score = 0
      const goalComplexityScore = processValue(goal.goalComplexity)
      const goalExcitementScore = processValue(goal.goalExcitement)
      const goalImportanceScore = goalDataState.length - goalDataState.indexOf(goal)

      score += goalComplexityScore + goalExcitementScore + goalImportanceScore

      return goal.goalScore = score
  }

  const calcProjectScore = (project: ProjectData) => {
      let score = 0
      const projectComplexityScore = processValue(project.projectComplexity)
      const projectExcitementScore = processValue(project.projectExcitement)
      const projectImportanceScore = projectDataState.length - projectDataState.indexOf(project)

      score += projectComplexityScore + projectExcitementScore + projectImportanceScore

      return project.projectScore = score
  }

  const calcAllScores = (projectDataState: ProjectData[], goalDataState: GoalData[]) => {
    const updatedProjectDataState = [...projectDataState]
    const updatedGoalDataState = [...goalDataState]
    updatedGoalDataState.map((goal) => calcGoalScore(goal))
    updatedProjectDataState.map((project) => calcProjectScore(project))

    updatedProjectDataState.map((project) => {
      const projectGoal = updatedGoalDataState.find((goal) => goal.goalId === project.projectGoal)

      if(projectGoal){
        const projectPriorityScore = project.projectScore += projectGoal.goalScore
        project.projectPriorityScore = projectPriorityScore
      }
      
      return
    })

    
    
    return updatedProjectDataState.sort((a,b) => b.projectPriorityScore - a.projectPriorityScore).filter((project) => project.projectStatus === "active")
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="flex flex-col">
          <nav className=" w-full flex items-center justify-between bg-secondary p-8">
            <h1>Task Prioritizer</h1>
            <ModeToggle />
          </nav>
          <main className="flex w-full flex-grow justify-center items-start p-8 gap-4">
              <ResultsSection
                sortedProjectState={calcAllScores(projectDataState, goalDataState)}
                goalDataState={goalDataState}
              />
            <div className="flex flex-col justify-center items-center border-2 border-grey-100 px-4">
              <h1 className="py-2 text-2xl font-semibold">Control Panel</h1>
              <div className="flex w-2/3 justify-center items-start  gap-2 ">
                <GoalSection
                  goalDataState={goalDataState}
                  setGoalDataState={setGoalDataState}
                  projectDataState={projectDataState}
                  setProjectDataState={setProjectDataState}
                  calcGoalScore={calcGoalScore}
                />
                <ProjectSection
                  projectDataState={projectDataState}
                  setProjectDataState={setProjectDataState}
                  goalDataState={goalDataState}
                  calcProjectScore={calcProjectScore}
                />
              </div>
            </div>
          </main>
          <footer className="w-full h-16 flex flex-none justify-center items-center bg-black">
            <div>by Mike Charpin</div>
          </footer>
        </div>
    </ThemeProvider>
  )
}

export default App

