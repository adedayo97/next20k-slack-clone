import { FaPlus } from "react-icons/fa6";
import { Button } from "./ui/button";
import Typography from "./ui/typography";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "./ui/input";
import ImageUpload from "./image-upload";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import { createWorkspace } from "@/actions/create-workspace";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCreateWorkspaceValues } from "@/hooks/create-workspace-values";
import { useState } from "react";

const CreateWorkspace = () => {
    const router = useRouter();
    const {imageUrl, updateImageUrl} = useCreateWorkspaceValues();
    const [isOpen, setIsOpen] = useState(false);
    const[isSubmitting, setIsSubmitting] = useState(false);


  const formschema = z.object({
    name: z.string().min(2, {
      message: "Workspace name should be two characters long",
    }),
  });
  
  const form = useForm<z.infer<typeof formschema>>({
    resolver: zodResolver(formschema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit({ name }: z.infer<typeof formschema>) {
    const slug = slugify(name, { lower: true});
    const invite_code = uuidv4();
    setIsSubmitting(true)


    const result = await createWorkspace({name, slug, invite_code,  imageUrl});

    setIsSubmitting(false);

    if (result?.error) {
        console.error(result.error)
    }
    form.reset();
    updateImageUrl('');
    setIsOpen(false);
    router.refresh();

    toast.success('Workspace created succesfully');
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => setIsOpen(prevalue => !prevalue)}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 p-2">
          <Button variant="secondary">
            <FaPlus />
          </Button>
          <Typography variant="span" text="Add workspace" /> {/* Use span instead of p */}
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="my-4">
            Create Workspace
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Typography variant="span" text="Name" /> {/* Use span instead of p */}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Your company name" {...field} />
                  </FormControl>
                  <FormDescription>
                    <Typography variant="span" text="This is your workspace name" /> {/* Use span instead of p */}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ImageUpload />
            <Button disabled={isSubmitting} type="submit" >
                <Typography variant="p" text="submit"/>
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkspace;


