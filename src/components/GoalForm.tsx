    import React, { useState } from "react";
    import { useForm, SubmitHandler, UseFormReturn } from "react-hook-form";
    import { zodResolver } from "@hookform/resolvers/zod";
    import * as z from "zod";
    import { v4 as uuidv4 } from 'uuid';
    import { supabase } from '@/supabaseClient.ts'

    import { Button } from "@/components/ui/button";
    import {
        Form,
        FormControl,
        FormField,
        FormItem,
        FormLabel,
        FormMessage,
    } from "@/components/ui/form";
    import { Input } from "@/components/ui/input";
    import {
        Dialog,
        DialogContent,
        DialogHeader,
        DialogTitle,
        DialogTrigger,
        DialogFooter,
        DialogClose,
    } from "@/components/ui/dialog";
    import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
    import { Textarea } from "@/components/ui/textarea";
    import { GradientPicker } from "./ui/GradientPicker";
    import { PlusIcon, PencilIcon } from "lucide-react";
    import { GoalData } from "@/data/flatFakeData";
    import { Session } from "@supabase/supabase-js";

    const formSchema = z.object({
        user_id: z.string(),
        goalId: z.string(),
        goalScore: z.number(),
        goalDesc: z.string().min(10, {
        message: "Goal must be at least 10 characters.",
        }).max(120, {
        message: "120 character limit."
        }),
        goalStatus: z.string(),
        goalMotivation: z.string(),
        goalComplexity: z.string(),
        goalExcitement: z.string(),
        goalColor: z.string(),
    });

    interface GoalFormProps {
        mode: "add" | "edit";
        goalDataState: GoalData[];
        setGoalDataState: React.Dispatch<React.SetStateAction<GoalData[]>>;
        calcGoalScore: (goal: GoalData) => number;
        goal: GoalData | undefined; 
        index: number | undefined; 
        workingOffline: boolean
        session: Session | null
    }

    const GoalForm: React.FC<GoalFormProps> = ({ mode, goalDataState, setGoalDataState, calcGoalScore, goal, index, workingOffline, session, }) => {
    const [background, setBackground] = useState(goal?.goalColor || '#075985');

    const form: UseFormReturn<z.infer<typeof formSchema>> = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        user_id: session?.user.id,
        goalId: goal?.goalId || uuidv4(),
        goalScore: goal?.goalScore || 0,
        goalMotivation: goal?.goalMotivation || "",
        goalStatus: goal?.goalStatus || "active",
        goalDesc: goal?.goalDesc || "",
        goalComplexity: goal?.goalComplexity || "",
        goalExcitement: goal?.goalExcitement || "",
        goalRank: goal?.goalRank || 0,
        goalColor: goal?.goalColor || "bg-[#115E59]" ,
    },
    });

    const { reset, formState } = form;
    const { isValid } = formState;

    const addGoalToDB = async (newGoal: GoalData) => {
        try {
            const { data, error } = await supabase
                .from("goals")
                .insert<GoalData>([newGoal])
                .single()
            if (error) throw error
            console.log("New goal added to database", data)
        } catch(error: any) {
            console.error("Error adding goal to database.", error.message)
        }
    }

    const updateGoalInDB = async (updatedGoal: GoalData) => {
        try {
            if(!supabase) throw new Error("Supabase cleint is not initialized.")
            const { data, error } = await supabase
                .from("goals")
                .update<GoalData>(updatedGoal)
                .eq("goalId", updatedGoal.goalId)
            if (error) throw error
            console.log("Goal Updated", data)
        } catch (error: any) {
            console.error("Error updating goal.", error.message)
        }
    }
    const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (data) => {
        const goalData = {
            user_id: session?.user.id,
            goalId: data.goalId,
            goalScore: data.goalScore,
            goalMotivation: data.goalMotivation.trim(),
            goalStatus: data.goalStatus,
            goalDesc: data.goalDesc.trim(),
            goalComplexity: data.goalComplexity,
            goalExcitement: data.goalExcitement,
            goalRank: 0,
            goalColor: background,
        }
        calcGoalScore(goalData);

        if (mode === "edit") {
            if (workingOffline) {
                const updatedGoalState = [...goalDataState];
                updatedGoalState[index as number] = goalData;
                setGoalDataState(updatedGoalState);
            } else {
                updateGoalInDB(goalData)
                const updatedGoalState = [...goalDataState];
                updatedGoalState[index as number] = goalData;
                setGoalDataState(updatedGoalState);
            }
           
        } else if (mode === "add") {
            if(workingOffline) {
                const updatedGoalState = [...goalDataState];
                updatedGoalState.push(goalData);
                setGoalDataState(updatedGoalState);
            } else {
                addGoalToDB(goalData)
                const updatedGoalState = [...goalDataState];
                updatedGoalState.push(goalData);
                setGoalDataState(updatedGoalState);
            }
            
        }

        reset();
    };

    return (
        <Dialog>
        <DialogTrigger asChild>
            <Button variant="ghost" className="w-8 h-8 p-0">{mode === "add" ? <PlusIcon /> : <PencilIcon />}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]" style={{ background }}>
            <DialogHeader>
            <DialogTitle>edit a goal</DialogTitle>
            <GradientPicker
                background={background}
                setBackground={setBackground}
            />
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                    control={form.control}
                    name="goalDesc"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>What are you trying to accomplish in a 6 month window?</FormLabel>
                        
                        <FormControl>
                            <Input placeholder="Get hired in the tech industry ASAP." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="goalMotivation"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Why? What is your motivation?</FormLabel>
                        
                        <FormControl>
                            <Textarea placeholder="I enjoy the challange of the problem selving and building products that people will use. I also need to pay rent." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    
                    <div className="flex justify-center gap-16">
                        <FormField
                            control={form.control}
                            name="goalComplexity"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel>complexity</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col justify-between items-startspace-y-1 gap-2"
                                    >
                                    <FormItem className="flex items-center space-x-3 space-y-0 gap-2">
                                        <FormControl>
                                        <RadioGroupItem value="low" />
                                        </FormControl>
                                        <FormLabel className="flex items-center text-md">
                                            small &nbsp; <span className="text-3xl">🍰</span>
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0 gap-2">
                                        <FormControl>
                                        <RadioGroupItem value="medium" />
                                        </FormControl>
                                        <FormLabel className="flex items-center text-2xl ">
                                            medium &nbsp; <span className="text-3xl">🔨</span>
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0 gap-2">
                                        <FormControl>
                                        <RadioGroupItem value="high" />
                                        </FormControl>
                                        <FormLabel className="flex items-center text-4xl">
                                            large &nbsp; <span className="text-3xl">🚀</span>
                                        </FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="goalExcitement"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel>excitement</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col justify-between space-y-1 "
                                    >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="high" />
                                        </FormControl>
                                        <FormLabel className="text-4xl">
                                            😄
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="medium" />
                                        </FormControl>
                                        <FormLabel className="text-4xl">
                                        😏
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="low" />
                                        </FormControl>
                                        <FormLabel className="text-4xl">
                                        😟
                                        </FormLabel>
                                    </FormItem>
                                    
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    
                    <DialogFooter>
                        <DialogClose asChild>
                            {mode === "add" ? <Button type="submit" disabled={!isValid}>add</Button> : <Button type="submit" disabled={!isValid}>save</Button>}
                        </DialogClose>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
    )
}

export default GoalForm