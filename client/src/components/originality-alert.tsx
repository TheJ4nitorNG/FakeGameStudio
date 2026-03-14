import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Lightbulb, X, Eye, EyeOff } from "lucide-react";
import { type OriginalityFlag } from "@/lib/originality-detector";

interface OriginalityAlertProps {
  flags: OriginalityFlag[];
  onDismiss?: () => void;
}

const SEVERITY_CONFIG = {
  mild: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: "text-yellow-500" },
  obvious: { bg: "bg-orange-500/10", border: "border-orange-500/30", icon: "text-orange-500" },
  shameless: { bg: "bg-red-500/10", border: "border-red-500/30", icon: "text-red-500" },
};

export function OriginalityAlert({ flags, onDismiss }: OriginalityAlertProps) {
  const [dismissed, setDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  useEffect(() => {
    setDismissed(false);
  }, [flags.length]);

  if (dismissed || flags.length === 0) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const worstSeverity = flags.reduce((worst, flag) => {
    const order = { mild: 0, obvious: 1, shameless: 2 };
    return order[flag.severity] > order[worst] ? flag.severity : worst;
  }, "mild" as OriginalityFlag["severity"]);

  const config = SEVERITY_CONFIG[worstSeverity];

  return (
    <Alert className={`${config.bg} ${config.border} border relative`} data-testid="alert-originality">
      <AlertTriangle className={`h-4 w-4 ${config.icon}`} />
      <AlertTitle className="flex items-center justify-between gap-2 pr-8">
        <span>Originality Detector Triggered</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setShowDetails(!showDetails)}
            data-testid="button-toggle-details"
          >
            {showDetails ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDismiss}
            data-testid="button-dismiss-alert"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </AlertTitle>
      <AlertDescription>
        {showDetails && (
          <div className="space-y-3 mt-3">
            {flags.map((flag, index) => (
              <div key={index} className="p-3 rounded-lg bg-background/50 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {flag.type}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Detected: "{flag.match}"
                  </Badge>
                  <Badge className={`text-xs ${
                    flag.severity === "shameless" ? "bg-red-500" :
                    flag.severity === "obvious" ? "bg-orange-500" : "bg-yellow-500"
                  }`}>
                    {flag.severity}
                  </Badge>
                </div>
                <p className="text-sm font-medium">{flag.snark}</p>
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  {flag.encouragement}
                </p>
                <p className="text-xs text-muted-foreground">
                  Similar to: <span className="font-medium">{flag.originalGame}</span>
                </p>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-3 italic">
          Don't worry - you can still continue! This is just friendly ribbing to spark creativity.
        </p>
      </AlertDescription>
    </Alert>
  );
}
