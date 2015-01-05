make manifest file: filename.exe.manifest

----------------------------------------

<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
<assemblyIdentity
    name="eipixTools"
    processorArchitecture="x86"
    version="3.2.0.0"
    type="win32"/>
<description>Eipix Tools for After Effects v3.2</description>
   <trustInfo xmlns="urn:schemas-microsoft-com:asm.v2">
      <security>
      <requestedPrivileges>
        <requestedExecutionLevel level="requireAdministrator" uiAccess="false"/>
      </requestedPrivileges>
    </security>
   </trustInfo>
</assembly>

----------------------------------------





Open the exe in ResHacker

Select Action>Add a new resource

Now select your manifest file

Use the following settings...

Resource Type: 24
Resource Name: 1

Save the exe