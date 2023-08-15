// http://www.alecjacobson.com/weblog/?p=3816
#import <Foundation/Foundation.h>
#import <Cocoa/Cocoa.h>
#import <unistd.h>

BOOL copy_to_clipboard(NSString *path)
{
  NSImage *image;
  if ([path isEqualToString:@"-"])
  {
    NSFileHandle *input = [NSFileHandle fileHandleWithStandardInput];
    image = [[NSImage alloc] initWithData:[input readDataToEndOfFile]];
  }
  else
  {
    image = [[NSImage alloc] initWithContentsOfFile:path];
  }
  BOOL copied = false;
  if (image != nil)
  {
    NSPasteboard *pasteboard = [NSPasteboard generalPasteboard];
    [pasteboard clearContents];
    NSArray *copiedObjects = [NSArray arrayWithObject:image];
    copied = [pasteboard writeObjects:copiedObjects];
    [pasteboard release];
  }
  [image release];
  return copied;
}

int main(int argc, const char *argv[])
{
  NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
  if (argc < 2)
  {
    printf("Usage:\n\n"
      "Copy file to clipboard:\n    ./osx-copy-image path/to/file\n\n"
      "Copy stdin to clipboard:\n    cat /path/to/file | ./osx-copy-image -");
    return EXIT_FAILURE;
  }
  NSString *path = [NSString stringWithUTF8String:argv[1]];
  BOOL success = copy_to_clipboard(path);
  [pool release];
  return (success ? EXIT_SUCCESS : EXIT_FAILURE);
}
