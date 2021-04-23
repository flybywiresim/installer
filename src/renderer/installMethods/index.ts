import EventEmitter from "events";
import TypedEventEmitter from "renderer/utils/TypedEmitter";
import { Mod, ModTrack } from "renderer/utils/InstallerConfiguration";

export interface InstallProgress {
    canCancel: boolean;
    infoText: string;
    buttonText: string;
    percent: number;
}

export interface InstallEvents {
    'progress': (progress: InstallProgress) => void;
    'aborted': () => void;
    'done': (result: InstallResult) => void;
    'error': (err: Error) => void;
}

export interface InstallResult {
    done: boolean;
    aborted: boolean;
}

// @ts-ignore
export abstract class InstallMethod<T> extends (EventEmitter as new () => TypedEventEmitter<InstallEvents>) {
    public abstract install(mod: Mod, track: ModTrack, abortSignal: AbortSignal, options: T): Promise<InstallResult>;
}
