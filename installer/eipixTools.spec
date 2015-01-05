# -*- mode: python -*-
a = Analysis(['eipixTools.py'],
             pathex=['D:\\repo\\eipixtools\\installer'],
             hiddenimports=[],
             hookspath=None,
             runtime_hooks=None)
pyz = PYZ(a.pure)
exe = EXE(pyz,
          a.scripts,
          a.binaries,
          a.zipfiles,
          a.datas,
          name='eipixTools.exe',
          debug=False,
          strip=None,
          upx=True,
          console=False , icon='img\\icon.ico')
