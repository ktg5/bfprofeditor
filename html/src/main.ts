import { BFPROF, type ProfSetting } from './BFPROF';


let currentProf: BFPROF | null = null;
let currentSettings: ProfSetting[] | null = null;

const btnActionAttr = 'btn-action';


window.addEventListener('load', () => {
    // DOM element to be in da thing to be idk lol
    const fileInput = document.querySelector('#prof-upload') as HTMLInputElement;
    fileInput.value = '';
    const saveBtn = document.querySelector('#prof-save') as HTMLButtonElement;

    const sideNavId = '#sidenav';
    const sideNav = document.querySelector(sideNavId) as HTMLDivElement;


    // File-related event listeners
    fileInput.addEventListener('change', async (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (!target.files || target.files.length === 0) return;
        const file = target.files[0];

        try {
            const arrayBuffer = await file.arrayBuffer();
            const rawData = new Uint8Array(arrayBuffer);

            currentProf = new BFPROF(rawData);
            currentSettings = currentProf.parse();

            console.log(`parsed ${currentSettings.length} settings!`);
            console.log(currentSettings);

            // UI
            toggleSideNav(true);
            saveBtn.disabled = false;


            // TODO: Make script/function for turning settings into UI stuff xdd
            
        } catch (error) {
            console.error("Error reading or parsing the PROFSAVE file:", error);
            alert("Failed to parse file. Make sure it's a valid PROFSAVE.");
        }
    });

    saveBtn.addEventListener('click', () => {
        if (!currentProf) return;

        const modifiedData: Uint8Array = currentProf.serialize();
        const blob = new Blob([modifiedData as BlobPart], { type: "application/octet-stream" });

        // Create a temporary, invisible link to trigger the download natively
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = "PROFSAVE";
        
        // Append, click, and clean up
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });


    // Sidenav stuff
    const closeOnClick = (e: PointerEvent) => {
        const target = e.target as HTMLElement;
        if (
            target.closest(sideNavId) !== null
            && target.closest(`${sideNavId} button`) === null
        ) return;
        else {
            toggleSideNav(true);
            document.removeEventListener('click', closeOnClick);
        }
    };
    function toggleSideNav(force?: boolean) {
        var result = sideNav.toggleAttribute('hide', force);

        // Make event listener to check if anything that isn't the topbar is clicked
        if (result === false) setTimeout(() => document.addEventListener('click', closeOnClick), 10);
        else document.removeEventListener('click', closeOnClick);

        return result;
    }


    // All [btn-action] elements
    const btnActionDivs = document.querySelectorAll(`[${btnActionAttr}]`) as NodeListOf<HTMLButtonElement>;
    btnActionDivs.forEach((btnActionDiv) => {
        const btnActionValue = btnActionDiv.getAttribute(btnActionAttr);

        switch (btnActionValue) {
            case 'sidenav':
                btnActionDiv.addEventListener('click', () => {
                    toggleSideNav();
                });
            break;
        
            default:
                console.warn(`btnActionDivs.forEach(): no btnActionValue was found under "${btnActionValue}"`);
            break;
        }
    });
});
