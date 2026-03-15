import {ModelId} from "@/app/lib/constants";
import {MODELS} from "@/app/lib/constants";

interface ModelSelectorProps {
    currentModel: ModelId;
    onModelChange: (model: ModelId) => void;
}

export default function ModelSelector({ currentModel, onModelChange }: ModelSelectorProps) {
    return (
        <select
            value={currentModel}
            onChange={(e) => onModelChange(e.target.value as ModelId)}
            className="border rounded-lg px-3 py-1"
        >
            {Object.entries(MODELS).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
            ))}
        </select>
    );
}
