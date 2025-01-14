import { useState, useEffect, useRef } from "react";
import { Box } from "@primer/react";
import { PageConfig } from '@jupyterlab/coreutils';
import { JupyterLab } from '@jupyterlab/application';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { ServiceManager } from "@jupyterlab/services";
import JupyterLabAppAdapter from "./JupyterLabAppAdapter";
import { JupyterLabAppCorePlugins } from "./JupyterLabAppPlugins";
import { useJupyter } from "../../jupyter/JupyterContext";
import JupyterLabAppCss from "./JupyterLabAppCss";
import { JupyterLabTheme } from "./../../jupyter/lab/JupyterLabTheme";

// The webpack public path needs to be set before loading the CSS assets.
(global as any).__webpack_public_path__ = PageConfig.getOption('fullStaticUrl') + '/';

export type JupyterLabAppProps = {
  hostId: string;
  extensions: Array<JupyterLab.IPluginModule>;
  mimeExtensions: Array<IRenderMime.IExtensionModule>;
  extensionPromises: Array<Promise<JupyterLab.IPluginModule>>;
  mimeExtensionPromises: Array<Promise<IRenderMime.IExtensionModule>>;
  position: string;
  width: string | number;
  height: string | number;
  devMode: boolean;
  headless: boolean;
  serviceManager?: ServiceManager;
  theme: JupyterLabTheme;
  onReady: (jupyterlabAdapter: JupyterLabAppAdapter) => void;
}

export const JupyterLabApp = (props: JupyterLabAppProps) => {
  const { hostId, position, height, width, headless, theme, onReady } = props;
  const { serviceManager } = useJupyter();
  const ref = useRef<HTMLDivElement>(null);
  const [_, setAdapter] = useState<JupyterLabAppAdapter>();
  useEffect(() => {
    if (ref && serviceManager) {
      const adapter = new JupyterLabAppAdapter({
        ...props,
        serviceManager,
      });
      adapter.ready.then(() => {
        onReady(adapter);
      });
      setAdapter(adapter);
    }
  }, [hostId, ref, serviceManager, theme]);
  return (
    <>
      <Box
        sx={{
          '& .jp-LabShell': {
            position: position as any,
            height: height as any,
            width: width as any,
            display: headless ? 'none' : 'inherit',
          },
        }}
      >
        <JupyterLabAppCss theme={theme}/>
        <div ref={ref} id={hostId}/>
      </Box>
    </>
  )
}

JupyterLabApp.defaultProps = {
  hostId: "app-example-id",
  extensions: [],
  mimeExtensions: [],
  extensionPromises: JupyterLabAppCorePlugins.extensionPromises,
  mimeExtensionPromises: JupyterLabAppCorePlugins.mimeExtensionPromises,
  position: "relative",
  width: "100%",
  height: "100vh",
  devMode: false,
  theme: 'light',
  headless: false,
  onReady: (jupyterlabAdapter: JupyterLabAppAdapter) => {}
} as Partial<JupyterLabAppProps>;

export default JupyterLabApp;
