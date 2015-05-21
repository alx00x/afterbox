from psd_tools import PSDImage
psd = PSDImage.load('my_image.psd')

merged_image = psd.as_PIL()
merged_image.save('my_image.png')