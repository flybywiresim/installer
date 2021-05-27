import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { InstallerStore } from '../../redux/store';
import { Close } from './styles';
import { callCustomWarningModal } from 'renderer/redux/actions/customWarningModal.actions';
import fs from "fs-extra";
import { Directories } from 'renderer/utils/Directories';

export const CustomWarningModal = (): JSX.Element => {

    const dispatch = useDispatch();

    const customWarningModal = useSelector((state: InstallerStore) => state.customWarningModal);

    const handleClose = () => {
        dispatch(callCustomWarningModal(false));
    };

    const handleContinue = () => {
        switch (customWarningModal.id) {
            case 'marketPlaceVersionInstalled':
                try {
                    fs.rmdirSync(Directories.inStore(customWarningModal.targetDirectory));
                    console.log('deleted' + Directories.inStore(customWarningModal.targetDirectory));
                } catch {
                    console.log('Error: could not delete marketplace version');
                }
                dispatch(callCustomWarningModal(false));
                break;
            default:
                dispatch(callCustomWarningModal(false));
                break;
        }
        dispatch(callCustomWarningModal(false));
    };

    const [title, setTitle] = useState<string>(null);
    const [text, setText] = useState<string>(null);
    const [continueActive, setContinueActive] = useState<boolean>(true);
    const [cancelActive, setCancelActive] = useState<boolean>(true);

    useEffect(() => {
        if (customWarningModal.active) {
            switch (customWarningModal.id) {
                case 'marketPlaceVersionInstalled':
                    setTitle('Warning!');
                    setText('It seems the A32NX is installed via the In-Game Marketplace. Do you wish to continue and uninstall the Marketplace version in favor of a version provided in this installer?');
                    setContinueActive(true);
                    setCancelActive(true);
                    break;
                default:
                    setTitle('SOMETHING WENT WRONG');
                    setContinueActive(false);
                    setCancelActive(false);
                    break;
            }
        } else {
            setTitle(null);
        }
    }, [customWarningModal]);

    if (customWarningModal.active) {
        return (
            <div className=" flex justify-center items-center fixed z-10 left-0 top-0 w-screen h-screen overflow-auto bg-black bg-opacity-40">
                <div className="relative w-520px bg-navy-lighter flex flex-col rounded-lg text-teal-50 p-5">
                    <Close className="absolute right-5 text-xl h-8 w-8" onClick={handleClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-x" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </Close>
                    <div className="text-3xl text-gray-50 mb-5">{title}</div>
                    <p>{text}</p>
                    <div className="flex justify-end items-center">
                        {cancelActive ? <button className="bg-white hover:bg-gray-200 px-5 ml-4 py-2 text-xl text-black font-bold rounded-lg" onClick={handleClose}>Cancel</button> : <></>}
                        {continueActive ? <button className="bg-green hover:bg-green-darker px-5 ml-4 py-2 text-xl text-white font-bold rounded-lg" onClick={handleContinue}>Continue</button> : <></>}
                    </div>
                </div>
            </div>
        );
    } else {
        return (<></>);
    }

};
