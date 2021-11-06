import React, { useState } from "react";
import { useSelector } from "react-redux";
import store, { InstallerStore } from "renderer/redux/store";
import * as actionTypes from '../../../redux/actionTypes';
import { LiveryConversion, LiveryDefinition } from "renderer/utils/LiveryConversion";
import { AlertTriangle, Check } from "tabler-icons-react";
import { Progress } from "antd";
import { LiveryState, LiveryStateEntry } from "renderer/redux/reducers/liveries.reducer";
import { LiveryAction, SetLiveryStateAction } from "renderer/redux/types";
import settings from "common/settings";

export const reloadLiveries = (): void => {
    store.dispatch({
        type: actionTypes.CLEAR_LIVERIES_STATE,
    });
    LiveryConversion.getIncompatibleLiveries().then((liveries) => {
        liveries.forEach((livery) => store.dispatch<LiveryAction>({
            type: actionTypes.SET_LIVERY_STATE,
            payload: {
                livery,
                state: LiveryState.DETECTED,
            },
        }));
    });
};

export const clearLiveries = (): void => {
    store.dispatch({
        type: actionTypes.CLEAR_LIVERIES_STATE,
    });
};

export const LiveryConversionDialog: React.FC = () => {
    const liveries = useSelector<InstallerStore, LiveryDefinition[]>((state) => {
        return state.liveries.map((entry) => entry.livery);
    });

    const selectedLiveries = useSelector<InstallerStore, LiveryDefinition[]>((state) => {
        return state.liveries
            .filter((entry) => entry.state === LiveryState.TO_BE_CONVERTED)
            .map((entry) => entry.livery);
    });

    const allLiveriesConverted = useSelector<InstallerStore, boolean>((state) => state.liveries.every((entry) => entry.state === LiveryState.CONVERTED));

    const [showList, setShowList] = useState(false);

    const buttonDisabled = () => {
        return showList && selectedLiveries.length == 0;
    };

    const handleDontAskAgain = () => {
        settings.set('mainSettings.disabledIncompatibleLiveriesWarning', true);

        clearLiveries();
    };

    const handleConvert = () => setShowList(true);

    const handleDone = () => clearLiveries();

    const handleCancel = () => setShowList(false);

    const handleConfirm = () => {
        selectedLiveries.forEach((livery) => {
            LiveryConversion.convertLivery(livery).then(() => {
                store.dispatch<LiveryAction>({
                    type: actionTypes.SET_LIVERY_STATE,
                    payload: {
                        livery,
                        state: LiveryState.CONVERTED,
                    },
                });
            }).catch((error) => {
                store.dispatch<LiveryAction>({
                    type: actionTypes.SET_LIVERY_STATE,
                    payload: {
                        livery,
                        state: LiveryState.ERROR_DURING_CONVERSION,
                        error
                    },
                });

                console.log(`[LCU] Removing failed package '${livery.packageName}_a32nx'...`);
                LiveryConversion.removeLivery(livery.packageName + '_a32nx');
            });
        });
    };

    return (
        <div className="flex flex-col gap-y-5 bg-red-600 px-5 py-5 rounded-lg">
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-2xl text-white font-semibold">
                        {liveries.length > 1 ? `${liveries.length} incompatible liveries are` : '1 incompatible livery is'} present in your Community folder.
                    </span>
                    <span className="text-xl text-white font-semibold mt-2.5">
                        Do you wish to convert them?
                    </span>
                    <span className="text-lg text-red-200 font-semibold">
                        Warning: it is your responsibility to make sure the livery authors allow conversion.
                    </span>
                </div>
                <div className="flex flex-row justify-center items-center">
                    {showList &&
                        <button
                            className={`w-32 bg-red-700 bg-opacity-40 mr-4 transition-colors duration-200 hover:bg-red-700 px-6 py-2 text-2xl rounded-lg text-white`}
                            onClick={allLiveriesConverted ? handleDone : handleCancel}
                        >
                            {allLiveriesConverted ? 'Done' : 'Cancel'}
                        </button>
                    }
                    {!showList &&
                        <a className="text-xl text-white font-semibold mr-3.5" onClick={handleDontAskAgain}>
                            Don't Ask Again
                        </a>
                    }
                    <button
                        disabled={buttonDisabled()}
                        className={`w-40 bg-red-500 transition-colors duration-200 hover:bg-red-700 px-6 py-2 text-2xl rounded-lg text-white ` + (buttonDisabled() ? 'pointer-events-none opacity-60' : '')}
                        onClick={showList ? handleConfirm : handleConvert}
                    >
                        {showList ? 'Confirm' : 'Convert'}
                    </button>
                </div>
            </div>

            {showList &&
                <>
                    <ConversionProgress />

                    <div className="flex flex-col gap-y-4">
                        <SelectAll />

                        {liveries.map((livery) =>
                            <LiveryEntry key={livery.packageName} livery={livery} />
                        )}
                    </div>
                </>
            }
        </div>
    );
};

const ConversionProgress: React.FC = () => {
    const conversionsToPerform = useSelector<InstallerStore, number>((state) => {
        return state.liveries.filter((entry) => entry.state === LiveryState.TO_BE_CONVERTED).length;
    });

    const completedConversions = useSelector<InstallerStore, number>((state) => {
        return state.liveries.filter((entry) => entry.state === LiveryState.CONVERTED).length;
    });

    return (
        <div className="flex flex-row gap-x-2 items-center">
            <Progress className="w-full" showInfo={false} percent={(completedConversions / (conversionsToPerform + completedConversions)) * 100} trailColor="#ef4444" strokeColor="white" />

            <span className=" w-16 text-xl text-white text-right">
                {(completedConversions || conversionsToPerform) ? Math.floor(completedConversions / (conversionsToPerform + completedConversions) * 100) + '%' : '0%'}
            </span>
        </div>
    );
};

const SelectAll: React.FC = () => {
    const entries = useSelector<InstallerStore, LiveryStateEntry[]>((state) => state.liveries);

    const allLiveriesSelected = useSelector<InstallerStore, boolean>((state) => state.liveries.every((entry) => entry.state === LiveryState.TO_BE_CONVERTED));

    const allLiveriesConverted = useSelector<InstallerStore, boolean>((state) => state.liveries.every((entry) => entry.state === LiveryState.CONVERTED));

    const handleToggleSelectAllLiveries = () => {
        // if all entries are selected we make all un-errored entries DETECTED
        // Otherwise, we make all un-errored entries TO_BE_CONVERTED.

        entries
            .filter((entry) => entry.state !== LiveryState.ERROR_DURING_CONVERSION)
            .forEach((entry) => store.dispatch<SetLiveryStateAction>({
                type: actionTypes.SET_LIVERY_STATE,
                payload: {
                    livery: entry.livery,
                    state: allLiveriesSelected ? LiveryState.DETECTED : LiveryState.TO_BE_CONVERTED,
                },
            }));
    };

    const backgroundColor = () => allLiveriesSelected ? 'bg-red-700' : 'bg-red-500';
    const opacity = () => allLiveriesConverted ? 'opacity-70' : 'opacity-100';
    const pointerEvents = () => allLiveriesConverted ? 'pointer-events-none' : '';

    return (
        <div className={`h-14 flex flex-row justify-between items-center ${backgroundColor()} ${opacity()} ${pointerEvents()} px-7 py-4 rounded-lg cursor-pointer`} onClick={handleToggleSelectAllLiveries}>
            <div className="flex flex-col">
                <span className="text-2xl text-white">{allLiveriesSelected ? 'Unselect All' : 'Select All'}</span>
            </div>

            {allLiveriesSelected &&
                <Check className="text-white" size={32} />
            }
        </div>
    );
};

type LiveryEntryProps = { livery: LiveryDefinition }

const LiveryEntry: React.FC<LiveryEntryProps> = ({ livery }) => {
    const entry = useSelector<InstallerStore, LiveryStateEntry>((state) => {
        return state.liveries.find((entry) => entry.livery === livery);
    });

    const handleSelected = () => {
        store.dispatch<SetLiveryStateAction>({
            type: actionTypes.SET_LIVERY_STATE,
            payload: {
                livery,
                state: entry.state === LiveryState.DETECTED ? LiveryState.TO_BE_CONVERTED : LiveryState.DETECTED,
            },
        });
    };

    const backgroundColor = () => entry.state === LiveryState.TO_BE_CONVERTED ? 'bg-red-700' : 'bg-red-500';
    const opacity = () => entry.state === LiveryState.CONVERTED ? 'opacity-70' : 'opacity-100';
    const pointerEvents = () => (entry.state === LiveryState.CONVERTED || entry.state === LiveryState.ERROR_DURING_CONVERSION) ? 'pointer-events-none' : '';

    return (
        <div
            className={`flex flex-col ${backgroundColor()} ${opacity()} ${pointerEvents()} px-7 py-4 rounded-lg cursor-pointer`}
            onClick={handleSelected}
        >
            <div className="flex flex-row justify-between">
                <div className="flex flex-col">
                    <span className="text-2xl text-white">{livery.title}</span>
                    <span className="text-xl text-white font-mono">{livery.packageName}</span>
                </div>

                {entry.state !== LiveryState.DETECTED &&
                    <div className="flex flex-row items-center">
                        {entry.state === LiveryState.CONVERTED &&
                            <>
                                <span className="text-2xl text-white font-semibold mr-3">Converted</span>
                                <Check className="text-white" size={32} />
                            </>
                        }
                        {entry.state === LiveryState.TO_BE_CONVERTED &&
                            <Check className="text-white" size={32} />
                        }
                        {entry.state === LiveryState.ERROR_DURING_CONVERSION &&
                            <AlertTriangle className="text-white" size={32} />
                        }
                    </div>
                }
            </div>

            {entry.state === LiveryState.ERROR_DURING_CONVERSION &&
                <span className="w-full bg-red-400 mt-5 px-5 py-2 text-white text-lg font-mono rounded-lg break-all">
                    {(typeof entry.error === 'string') ? entry.error : entry.error.message}
                </span>
            }
        </div>
    );
};
