import { Button } from "@/app/components/ui/Button";
import ClippedCard from "@/app/components/ui/ClippedCard";

export default function AboutPage() {
   return (
      <div>
         <Button variant={"secondary"}>Test</Button>
         <div className="grid grid-cols-3 gap-6">
            <ClippedCard
               href="/learn-more"
               cardBgColorVar="var(--color-gray)" // Default light gray background for clipped state
               textColorVar="var(--color-dark-gray)" // Default text color
               hoverBgColorVar="var(--color-gray)" // Blue background for full card on hover
               hoverTextColorVar="var(--color-dark-gray)" // White text color on hover
            >
               <div className="py-4">
                  <h3 className="text-2xl font-bold mb-2">
                     Dynamic Card Effect
                  </h3>
                  <p className="text-lg">
                     Watch the clip disappear and the card fill smoothly on
                     hover!
                  </p>
               </div>
            </ClippedCard>
         </div>
      </div>
   );
}
