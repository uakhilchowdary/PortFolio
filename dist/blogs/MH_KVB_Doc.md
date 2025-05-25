# MH DOCUMENTATION (KVB)

## Table of Contents
1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Core Components](#core-components)
4. [Data Models](#data-models)
5. [Workflow Processes](#workflow-processes)
6. [Integration Points](#integration-points)
7. [Security Mechanisms](#security-mechanisms)
8. [Utility Functions](#utility-functions)
9. [Error Handling](#error-handling)
10. [Testing Framework](#testing-framework)
11. [Configuration Management](#configuration-management)
12. [File-by-File Analysis](#file-by-file-analysis)
13. [Common Scenarios and Solutions](#common-scenarios-and-solutions)
14. [Troubleshooting Guide](#troubleshooting-guide)
15. [Developer Quick Reference](#developer-quick-reference)
16. [Appendices](#appendices)

## Introduction

The Messaging Hub (MH) is a Java-based banking integration platform developed by Polaris Software Labs Limited (now Intellect Design Arena). This system serves as a middleware solution that facilitates the exchange of financial data between various banking systems, handling file processing, data validation, transformation, and secure transmission.

### Purpose

The MH framework is designed to process various types of banking files and messages such as NEFT, RTGS, EFT, and other financial transactions. It provides a comprehensive framework for:

- Receiving and processing incoming files from external systems
- Validating file formats, structures, and checksums
- Processing financial data according to business rules
- Generating outgoing files for external systems
- Maintaining audit trails and error logs
- Secure transmission and storage of financial data

### Scope

This documentation covers the entire codebase, including:

- Core file processing framework
- Data models and structures
- Workflow processes
- Integration mechanisms
- Security implementations
- Utility functions
- Error handling mechanisms
- Testing approaches

### System Overview Diagram

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│                 │     │                  │     │                   │
│ External System │────▶│ Messaging Hub    │────▶│ Core Banking      │
│ (Source)        │     │ (MH)             │     │ System            │
│                 │     │                  │     │                   │
└─────────────────┘     └──────────────────┘     └───────────────────┘
                               │   ▲
                               │   │
                               ▼   │
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│                 │     │                  │     │                   │
│ Database        │◀───▶│ File Systems     │     │ Other Banking     │
│ (Oracle)        │     │ (Input/Output)   │     │ Systems           │
│                 │     │                  │     │                   │
└─────────────────┘     └──────────────────┘     └───────────────────┘
```

## System Architecture

### High-Level Architecture

The system follows a modular architecture with clear separation of concerns:

1. **Presentation Layer**: Not explicitly present in the codebase as this is a middleware system
2. **Business Logic Layer**: Contains the core processing logic
   - File validation
   - Data transformation
   - Business rule application
3. **Data Access Layer**: Handles database operations
4. **Integration Layer**: Manages communication with external systems
5. **Utility Layer**: Provides common functionality across the system

### Package Organization

The system is organized into the following key packages:

```
com.intellect.interfaces
├── common           # Constants and common definitions
├── dao              # Data Access Objects for database operations
├── exception        # Custom exceptions
├── file             # File-specific operations
├── fileProcess      # Core file processing logic
├── log              # Logging functionality
├── mail             # Email notification capabilities
├── message          # Message processing
├── util             # Utility classes
├── vo               # Value Objects (data models)
└── zipcrpt          # Zip and encryption utilities
```

### Key Design Patterns

The codebase implements several design patterns:

1. **Factory Pattern**: Used in `FileProcessFatory.java` and `FileValidationFatory.java` to create appropriate implementations
2. **Abstract Factory Pattern**: Used for creating related objects without specifying concrete classes
3. **Strategy Pattern**: Different strategies for file processing, validation, and transformation
4. **Data Access Object (DAO)**: Encapsulates database operations
5. **Value Object (VO)**: Encapsulates data for transfer between layers
6. **Singleton Pattern**: Used for database connections (FileProcessConnection)

## Core Components

### FileProcess.java

The central component that orchestrates the entire file processing workflow.

**Key Responsibilities:**
- Receives incoming message/file information
- Generates reference numbers for tracking
- Inserts records into message_master table
- Validates message format and structure
- Updates processing status in database
- Delegates to appropriate processing components
- Handles error conditions and notifications

**Workflow:**
1. Generate or obtain a reference number
2. Insert details into message_master
3. Validate message format
4. Update message_master with validation results
5. Process the file/message content
6. Handle errors and update status
7. Generate notifications

```java
public void process(String msgTxt, String flow) throws FileProcessException {
    String uuid = UUID.randomUUID().toString();
    Calendar calC=Calendar.getInstance();
    String refNo=calC.get(Calendar.YEAR)+""+calC.get(Calendar.DAY_OF_YEAR)+""+calC.getTimeInMillis();
    MDC.put("CROSSMESSAGEREF", refNo);
    
    // Process message and handle workflow
    // ...
}
```

### FileProcessAbstract.java

An abstract base class that defines the contract for file processing implementations.

**Key Features:**
- Defines abstract process method for specific implementations
- Provides utility methods for notification handling
- Manages error tracking and reporting

```java
public abstract class FileProcessAbstract {
    // Abstract method for implementing specific processing logic
    public abstract boolean process(MessageMasterVO messageMasterVO,
            FileMasterVO fileMasterVO, FeedConfigVO feedConfigVO)
            throws FileProcessException;
            
    // Common functionality for notification updates
    public boolean sendNotificationUpdate(MessageMasterVO messageMasterVO,
            FileMasterVO fileMasterVO, String errStr, boolean notificationStatus)
            throws FileProcessException {
        // Implementation for notification updates
        // ...
    }
}
```

### XML Processing (TeswtXMLReading.java)

Handles XML parsing and processing, particularly for customer facility limits.

**Key Functionality:**
- Parses SOAP XML responses
- Extracts limit information
- Builds hierarchical limit structures
- Stores and retrieves limit data from database

```java
public String getLimitData(String xml) {
    StringBuffer strb = new StringBuffer();
    try {
        // Parse XML data
        ArrayList<LimitTreeVO> arrList = parseLimitTreeData(xml);
        
        // Process and store data
        // ...
        
        // Format and return results
        // ...
    } catch (Exception e) {
        e.printStackTrace();
    }
    return strb.toString();
}
```

### File Validation Framework

The system includes a comprehensive validation framework for files:

- Format validation
- Structure validation
- Checksum verification
- Encryption validation
- Business rule validation

## Data Models

### Value Objects (VO)

The system uses Value Objects to encapsulate data and transfer it between layers.

#### FileMasterVO.java

Represents information about a file being processed.

**Key Properties:**
- File name and path
- Processing status
- Record counts (total, success, failed)
- Error information
- Bank reference ID
- Feed name and type

```java
public class FileMasterVO {
    private String fileName;
    private String dirName;
    private String fileProcessStatus;
    private String bankReferenceId;
    private String feedName;
    private String feedType;
    private String totalRecords;
    private String successRecords;
    private String failedRecords;
    // Additional properties and methods
    // ...
}
```

#### MessageMasterVO.java

Represents a message being processed through the system.

**Key Properties:**
- Message reference ID
- Message text
- Flow direction
- Validation status
- Feed configuration

#### FeedConfigVO.java

Contains configuration for different feed types.

**Key Properties:**
- Feed name
- Validation rules
- Processing parameters
- Checksum configurations
- Encryption settings

#### LimitTreeVO.java

Represents a node in the customer limit hierarchy.

**Key Properties:**
- Customer ID (CIF)
- Facility ID
- Limit amount
- Utilized amount
- Parent and current reference codes
- Start and expiry dates

### Graph and Node Implementation

For processing hierarchical data structures like limit trees, the system implements a graph data structure:

#### Node.java

```java
public class Node {
    private String id;
    private String parent;
    private boolean isVisted=false;
    public List<Node> adjacentNodes=new LinkedList<Node>();
    
    // Getters and setters
    // ...
    
    public void addAdjacentNodes(Node temp) {
        adjacentNodes.add(temp);
    }
}
```

#### Graph.java

```java
public class Graph {
    private HashMap<String,Node> hs=new HashMap<String,Node>();
    
    public Node getNode(String temp) {
        if(hs.containsKey(temp)) {
            return hs.get(temp);
        }
        Node newNode=new Node();
        hs.put(temp, newNode);
        return newNode;
    }
    
    public void breadthFirstTraversal(Node rootNode) {
        Queue<Node> q = new LinkedList<Node>();
        q.add(rootNode);
        rootNode.setVisted(true);
        while(!q.isEmpty()) {
            Node n = (Node)q.poll();
            // Process node
            // ...
            for(Node adj : n.adjacentNodes) {
                if(!adj.isVisted()) {
                    adj.setVisted(true);
                    q.add(adj);
                }
            }
        }
    }
}
```

## Workflow Processes

### Incoming File Processing

1. **Message Receipt**
   - System receives a message with file information
   - Format: `hdr_Tran_Id=<FEED_NAME>~*hdr_Status=NULL~*FEED|<REFERENCE>||<FEED_NAME>||<FILE_NAME>|<DIRECTORY>|`

2. **Message Validation**
   - Validate message format
   - Check for feed configuration in database
   - Verify required parameters

3. **File Validation**
   - Verify file exists in specified location
   - Check file format and structure
   - Validate checksum if configured
   - Decrypt file if encrypted

4. **File Processing**
   - Parse file content
   - Apply business rules
   - Extract and transform data

5. **Status Update**
   - Update file_master and message_master tables
   - Generate status file if configured
   - Send notifications if configured

6. **Error Handling**
   - Log errors to database
   - Generate error notifications
   - Update file status

### Limit Tree Processing

1. **XML Receipt**
   - System receives an XML message with limit information

2. **XML Parsing**
   - Parse SOAP envelope
   - Extract limit data elements

3. **Hierarchical Processing**
   - Build limit tree structure
   - Determine parent-child relationships

4. **Database Storage**
   - Store limit information in database
   - Maintain hierarchical relationships

5. **Retrieval and Formatting**
   - Retrieve limit information by CIF and facility ID
   - Format data for consumption by other systems

### Sequence Diagram for Incoming File Processing

```
Client                 FileProcess           MessageValidation       FileValidation       DAO
  |                        |                       |                      |                |
  |--process(msgTxt,flow)--|                       |                      |                |
  |                        |--getRefNumber()-------|----------------------|--------------->|
  |                        |<-reference number-----|----------------------|----------------|
  |                        |--insertMessageMaster()|----------------------|--------------->|
  |                        |<-success--------------|----------------------|----------------|
  |                        |--validateMessage()---->                      |                |
  |                        |                       |--validation---------->                |
  |                        |<-validation results---|                      |                |
  |                        |--updateMessageMaster()|----------------------|--------------->|
  |                        |<-update success-------|----------------------|----------------|
  |                        |--validateFile()-------|---------------------->                |
  |                        |                                              |--validation--->|
  |                        |<-validation results-----------------------------|              |
  |                        |--process file---------|----------------------|--------------->|
  |                        |<-processing results---|----------------------|----------------|
  |<-process complete------|                       |                      |                |
```

## Integration Points

### Database Integration

The system uses JDBC for database operations, primarily through the `FileProcessDAO` class.

**Key Database Tables:**
- **message_master**: Stores message processing details
- **file_master**: Stores file processing information
- **feed_config**: Contains configuration for different feed types
- **LIMIT_TREE_RESPONSE**: Stores hierarchical limit data

### External System Integration

#### Web Service Integration

Integration with SOAP web services, as seen in the `TeswtXMLReading.java` class for retrieving customer facility limits:

```java
private String callIntegLimit(String cif, String faciltyId, String unitId) throws Exception {
    try {
        // Set up JNDI context
        String contextFactory = rsBundlemain.getString("CONTEXTFACTORY");
        String providURL = rsBundlemain.getString("PROVIDER_URL");
        Context jndiContext = null;
        
        Properties properties = new Properties();
        properties.put(Context.INITIAL_CONTEXT_FACTORY, contextFactory);
        properties.put(Context.PROVIDER_URL, providURL);
        jndiContext = new InitialContext(properties);

        // Look up EJB
        TreControlHome treHome;
        TreControlRemote treRemote;
        treHome = (TreControlHome) jndiContext.lookup("CONTROL");
        treRemote = (TreControlRemote) treHome.create();
        
        // Prepare and send message
        String nvpMessage = rsBundlemain.getString("LIMIT_INQ");
        nvpMessage = nvpMessage.replace("#UNITID#", unitId);
        nvpMessage = nvpMessage.replace("#CIF#", cif);
        nvpMessage = nvpMessage.replace("#FACILITYID#", faciltyId);
        
        // Process response
        String result = treRemote.treMain(nvpMessage);
        // ...
    } catch (Exception e) {
        throw e;
    }
}
```

#### File-Based Integration

The system processes files in various formats from external systems:

- Fixed-width files
- Delimited files (CSV, pipe-delimited)
- XML files
- Encrypted files

## Security Mechanisms

### Encryption and Decryption

The system supports multiple encryption algorithms:

#### Triple DES Implementation

```java
public class TripleDES {
    private static final String KEY_STRING = "167-42-158-164-248-173-50-74-193-73-82-185-76-145-247-188-167-42-158-164-248-173-50-74";

    public String encrypt(String source) {
        try {
            // Get our secret key
            Key key = getKey();

            // Create the cipher
            Cipher desCipher = Cipher.getInstance("DESede");

            // Initialize the cipher for encryption
            desCipher.init(Cipher.ENCRYPT_MODE, key);

            // Our cleartext as bytes
            byte[] cleartext = source.getBytes();

            // Encrypt the cleartext
            byte[] ciphertext = desCipher.doFinal(cleartext);

            // Return a String representation of the cipher text
            return getString(ciphertext);
        } catch (Exception e) {
            // Error handling
        }
        return null;
    }
    
    public String decrypt(String source) {
        // Decryption implementation
        // ...
    }
}
```

### Checksum Validation

The system supports various checksum algorithms (MD5, SHA) and formats:

- First line of file
- Last line of file
- In header file
- In trailer file
- In message body

```java
public boolean checkSumCheck(MessageMasterVO messageMasterVO,
        FileMasterVO fileMasterVO, FeedConfigVO feedConfigVO) {
    // Implementation for checksum validation
    // ...
}
```

## Utility Functions

### File Processing Utilities

The `FileProcessUtil` class provides common functionality for file operations:

- File existence checks
- Directory creation
- File reading and writing
- File movement
- Checksum generation and validation
- Encryption and decryption

### XML Processing Utilities

The system includes utilities for XML processing:

```java
private org.w3c.dom.Document getXMLDocument(String p_inputXml)
        throws SAXNotRecognizedException, SAXNotSupportedException,
        SAXException, IOException {
    StringReader sreader = new StringReader(p_inputXml);
    InputSource is = new InputSource(sreader);
    DOMParser parser = new DOMParser();
    parser.setFeature("http://apache.org/xml/features/validation/dynamic", true);
    parser.setFeature("http://apache.org/xml/features/dom/include-ignorable-whitespace", false);

    try {
        parser.parse(is);
    } catch (Exception e) {
        e.printStackTrace();
    }
    return parser.getDocument();
}
```

## Error Handling

The system implements a comprehensive error handling mechanism using custom exceptions and error logging.

### Custom Exceptions

The `FileProcessException` class extends Exception and includes additional fields for error codes and detailed messages:

```java
public class FileProcessException extends Exception {
    private int errorCode;
    private String errorMessage;
    
    public FileProcessException(String message, int errorCd) {
        super(message);
        this.errorMessage = message;
        this.errorCode = errorCd;
    }
    
    public FileProcessException(String message, int errorCd, Throwable cause) {
        super(message, cause);
        this.errorMessage = message;
        this.errorCode = errorCd;
    }
    
    // Getters for error code and message
    // ...
}
```

### Error Constants

Error codes and messages are defined in the `FileProcessErrorConstants` class:

```java
public class FileProcessErrorConstants {
    public static final int EXCEPTION_CODE = 999;
    public static final int EXCEPTION_CODE_SQL = 998;
    public static final int ERROR_CODE_MESSAGE_EMPTY = 100;
    public static final int ERROR_CODE_MESSAGE_FORMAT = 101;
    public static final int ERROR_CODE_FEED_MAINTENANCE = 102;
    // Additional error codes and messages
    // ...
}
```

### Error Logging

Errors are logged to both log files and the database:

```java
public void insertErrorTab(ErrorVO errorVO) throws FileProcessException {
    // Implementation for inserting error details into database
    // ...
}
```

## Testing Framework

The codebase includes test classes for various components:

### TestFileProcess.java

Tests the end-to-end file processing workflow:

```java
public static void testFullFlow() {
    try {
        FileProcess fp = new FileProcess();
        fp.process(
                "hdr_Tran_Id=BILLREG_XLS_IN~*hdr_Status=NULL~*FEED|BILLREG29052019001|BILLREG29052019001|BILLREG_XLS_IN|S|PDG11_BILLREG_IN_1605201900001.xls|/usr1/SIR11784/GTB_HOME/INTERFACE_HOME/BILLREG_XLS_IN/incoming/||003",
                "I");
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

### Test Cases for Checksum Validation

```java
public static void testChecksum() {
    FileProcessUtil fu = new FileProcessUtil();
    try {
        MessageMasterVO messageMasterVO = new MessageMasterVO();
        FileMasterVO fileMasterVO = new FileMasterVO();
        FeedConfigVO feedConfigVO = new FeedConfigVO();
        feedConfigVO.setCheckSumValdationRequired("Y");

        messageMasterVO.setDirName("D:\\Intellect\\Interface\\2_IDFC\\CTS\\testing\\");
        fileMasterVO.setDirName("D:\\Intellect\\Interface\\2_IDFC\\CTS\\testing\\");

        feedConfigVO.setCheckSumAlgoritham("MD5");
        feedConfigVO.setCheckSumPrefix("CHECKSUM|");

        System.out.println("check sum inside first line of file");
        feedConfigVO.setCheckSumAvalible("LAST_LINE_WITH_PREFIX");
        fileMasterVO.setFileName("ALL_BANK_MICR_28102018_01.txt");
        System.out.println(fu.checkSumCheck(messageMasterVO, fileMasterVO, feedConfigVO));
    } catch (Exception e) {
        System.out.println("Exception in process " + e.getMessage());
    }
}
```

## Configuration Management

The system uses resource bundles for configuration management:

```java
public static ResourceBundle rsBundlemain = ResourceBundle.getBundle(AppConstants.APPLICATION);
```

### Key Configuration Properties

- Database connection details
- File paths and locations
- Encryption keys and algorithms
- Integration endpoints
- Processing parameters

### Database Configuration

Feed-specific configurations are stored in the database, allowing for dynamic configuration without code changes.

## File-by-File Analysis

This section provides a detailed analysis of each file in the Messaging Hub Financial Integration System, explaining its purpose, structure, and interactions with other components.

### Project Structure and Organization

#### Directory Structure

The Messaging Hub Financial Integration System is organized into several key directories:

- **/IFileProcess**: Main project directory
  - **/bin**: Compiled class files
  - **/src**: Source code files
    - **/com/intellect/interfaces**: Core package structure
  - **/META-INF**: Metadata information and manifest
  - **/.settings**: Eclipse IDE settings
  - Root files: `.classpath`, `.project`, and utility Java files

- **/InwardRemitFeedMDB**: Module for handling inward remittance feeds
  - **/ejbModule**: Contains EJB implementations
  - **/build**: Build artifacts
  - **/.settings**: Module-specific settings

- **/MessageIncomingEJB**: Module for handling incoming message processing
  - **/ejbModule**: Contains EJB implementations
  - **/build**: Build artifacts
  - **/.settings**: Module-specific settings

- **/Integratorplugins**: Integration plugins module
  - **/bin**: Compiled classes 
  - **/src**: Plugin source code
  - **/Resources**: Resource files for the plugins
  - **/.settings**: Module-specific settings

#### Package Organization

The main functional code is organized into the following package hierarchy:

```
com.intellect.interfaces
├── common           # Constants and definitions
├── dao              # Data Access Objects
├── exception        # Custom exceptions
├── file             # File operations
├── fileProcess      # Core processing
├── log              # Logging functionality
├── mail             # Email capabilities
├── message          # Message processing
├── util             # Utilities
├── vo               # Value Objects
└── zipcrpt          # Compression and encryption
```

#### Dependency Management

The project uses multiple external libraries, as seen in the `.classpath` file:

- Database connectivity: Oracle JDBC drivers
- XML processing: Xerces
- Encryption: Bouncy Castle
- File processing: Apache POI for Excel, iText for PDF
- Logging: Log4j
- EJB: Java EE libraries
- Remote connectivity: JSch for SSH
- Image processing: JAI libraries

### Core Processing Files

#### FileProcess.java

**Location**: `com.intellect.interfaces`

**Purpose**: Central orchestrator for all file processing operations.

**Key Components**:
- Process method that handles incoming and outgoing files/messages
- Integration with message validation, file validation, and processing components
- Error handling mechanism
- Status update and notification management

**Interactions**:
- Calls `FileProcessDAO` for database operations
- Uses `MessageValidationInterface` for message validation
- Uses `FileValidationInterface` for file validation
- Delegates to specific implementations via `FileProcessAbstract`

**Workflow**:
1. Receives a message with file information
2. Generates a unique reference ID
3. Stores message details in the database
4. Validates the message format
5. Retrieves feed configuration
6. Validates the file
7. Processes the file based on feed type
8. Updates status and generates notifications
9. Handles any errors that occur during processing

**Sample Usage**:
```java
FileProcess fp = new FileProcess();
fp.process("hdr_Tran_Id=ACCT_FEED~*hdr_Status=NULL~*FEED|CORE20131220212127||ACCT_FEED||ACCT_FEED_20140721120158|/path/to/file/|", "I");
```

#### FileProcessAbstract.java

**Location**: `com.intellect.interfaces`

**Purpose**: Abstract base class defining the contract for file processing implementations.

**Key Components**:
- Abstract `process` method for implementing specific file processing logic
- Concrete `sendNotificationUpdate` method for handling notifications
- Error handling and tracing support

**Implementation Details**:
- Maintains error details in static `errTab` variable
- Provides consistent notification updating across different implementations
- Manages database updates for notification status
- Uses a template method pattern for consistent processing

**Method Signature**:
```java
public abstract boolean process(MessageMasterVO messageMasterVO, 
                               FileMasterVO fileMasterVO, 
                               FeedConfigVO feedConfigVO) 
                               throws FileProcessException;
```

#### FileProcessFatory.java

**Location**: `com.intellect.interfaces`

**Purpose**: Factory class for creating appropriate file processing implementations.

**Implementation Details**:
- Uses a static map to store and retrieve processor implementations
- Creates processor instances based on feed type or processing requirements
- Implements the Factory design pattern
- Supports runtime determination of processor implementation

**Key Method**:
```java
public static FileProcessAbstract getFileProcessor(String feedType) {
    // Returns appropriate implementation based on feed type
}
```

### Database Access Layer

#### FileProcessDAO.java

**Location**: `com.intellect.interfaces.dao`

**Purpose**: Data Access Object providing database operations for the file processing system.

**Key Functionality**:
- Message and file record insertion
- Status updates
- Feed configuration retrieval
- Error logging
- Process date handling

**Main Methods**:
- `getRefNumber()`: Retrieves a unique reference number
- `insertMessageMaster()`: Inserts message details into the database
- `updateMessageMaster()`: Updates message status
- `getFeedMaintenance()`: Retrieves feed configuration
- `insertFileMaster()`: Creates a new file record
- `updateFileMasterStatus()`: Updates file processing status
- `insertFileMasterTrace()`: Logs file processing trace

#### FileProcessConnection.java

**Location**: `com.intellect.interfaces.util`

**Purpose**: Singleton class for managing database connections.

**Implementation Details**:
- Uses Singleton pattern for connection management
- Handles connection pooling
- Provides transaction support
- Manages connection lifecycle

### Data Models

#### FileMasterVO.java

**Location**: `com.intellect.interfaces.vo`

**Purpose**: Value Object representing a file being processed.

**Key Fields**:
- `fileName`: Name of the file being processed
- `dirName`: Directory path where the file is located
- `fileProcessStatus`: Current processing status
- `bankReferenceId`: Unique identifier for tracking
- `feedName`: Type of feed being processed
- `totalRecords`, `successRecords`, `failedRecords`: Processing statistics
- `errorRecord`, `errCode`, `errMsg`: Error details

**Methods**:
- Various getters and setters
- `isAbort()`: Determines if processing should be aborted
- `isFileProcessed()`: Checks if file has been already processed
- `isJobAbort()`: Checks if job was aborted

**Status Codes**:
- `FILE_PROCESSSTATED` (1): Process started
- `FILE_PROCESSING` (2): Processing in progress
- `FILE_PROCESSED` (3): Processing completed
- `FILE_FILEREJECTED` (4): File rejected
- `FILE_STATUSFILEGENERATED` (5): Status file generated
- `FILE_NOTIFICATIONSEND` (6): Notification sent
- `FILE_NOTIFICATIONFAILED` (7): Notification failed
- `FILE_REDIRECTFAILED` (8): Redirect failed

#### MessageMasterVO.java

**Location**: `com.intellect.interfaces.vo`

**Purpose**: Value Object representing a message being processed.

**Key Fields**:
- `msgRefId`: Unique message reference ID
- `msgTxt`: Actual message text content
- `flow`: Direction of flow (inbound/outbound)
- `validMessage`: Flag indicating message validity
- `feedConfigVO`: Related feed configuration
- `feedName`: Feed identifier
- `fileName`: Associated file name
- `dirName`: Directory path
- `checkSum`: Checksum values

**Methods**:
- Data access getters and setters
- Validation status methods
- Type determination methods (isFeed, isRequest, etc.)

#### FeedConfigVO.java

**Location**: `com.intellect.interfaces.vo`

**Purpose**: Configuration parameters for different feed types.

**Key Fields**:
- `feedName`: Feed identifier
- `fileNameValidationReqd`: File name validation flag
- `fileNameRegEx`: Regular expression for file name validation
- `dirPath`: Directory path for the feed
- `checkSumValdationRequired`: Checksum validation flag
- `checkSumAlgoritham`: Checksum algorithm (MD5, SHA, etc.)
- `checkSumAvalible`: Checksum location in file
- `fileCryptoValidationRequired`: Encryption flag
- `fileCryptoAlgorithm`: Encryption algorithm
- `invokeDuring`: Execution timing

#### LimitTreeVO.java

**Location**: `com.intellect.interfaces.vo`

**Purpose**: Value Object for customer facility limits in hierarchical structure.

**Key Fields**:
- `cif`: Customer Information File ID
- `facilityId`: Facility identifier
- `lmtAmt`: Limit amount
- `utilizedAmt`: Utilized amount
- `prntRfCd`: Parent reference code
- `crntRfCd`: Current reference code
- `startDate`, `expityDate`: Validity period
- `lbl`: Label for the limit
- `level`: Level in hierarchy

### Graph and Node Implementation

#### Node.java

**Location**: Root package

**Purpose**: Represents a node in a graph data structure, used for hierarchical data processing.

**Key Components**:
- `id`: Node identifier
- `parent`: Parent node identifier
- `isVisted`: Flag for traversal algorithms
- `adjacentNodes`: List of connected nodes

**Methods**:
- `addAdjacentNodes()`: Adds a node to the adjacency list
- Various getters and setters for node properties

**Usage Context**:
- Used primarily in limit tree processing
- Implements a directed graph structure
- Enables hierarchical data traversal

**Implementation Details**:
```java
public class Node {
    private String id;
    private String parent;
    private boolean isVisted=false;
    public List<Node> adjacentNodes=new LinkedList<Node>();
    
    // Methods for node manipulation
    // ...
}
```

#### Graph.java

**Location**: Root package

**Purpose**: Graph implementation for hierarchical data processing.

**Key Components**:
- HashMap storing nodes by their identifiers
- Methods for node retrieval and creation
- Breadth-first traversal implementation

**Methods**:
- `getNode()`: Retrieves or creates a node
- `breadthFirstTraversal()`: Implements BFS algorithm for graph traversal

**BFS Implementation**:
```java
public void breadthFirstTraversal(Node rootNode) {
    Queue<Node> q = new LinkedList<Node>();
    q.add(rootNode);
    rootNode.setVisted(true);
    while(!q.isEmpty()) {
        Node n = q.poll();
        
        // Process node data
        System.out.println("Processing node: " + n.getId());
        
        // Add child nodes to queue
        for(Node adj : n.adjacentNodes) {
            if(!adj.isVisted()) {
                adj.setVisted(true);
                q.add(adj);
            }
        }
    }
}
```

**Sample Usage**:
```java
Graph g = new Graph();
Node parent = g.getNode("parentId");
Node child = g.getNode("childId");
parent.setId("parentId");
child.setId("childId");
child.setParent("parentId");
parent.addAdjacentNodes(child);
g.breadthFirstTraversal(parent);
```

### XML Processing Files

#### TeswtXMLReading.java

**Location**: Root package

**Purpose**: Handles XML parsing and processing, particularly for customer facility limits.

**Key Components**:
- Methods for parsing SOAP XML responses
- Database operations for storing and retrieving limit data
- Hierarchical data processing using graph structures

**Key Methods**:
- `getLimitData()`: Processes XML and extracts limit information
- `parseLimitTreeData()`: Parses XML into limit tree structure
- `getXMLDocument()`: Utility method for DOM parsing
- `insertLimitTree()`: Stores limit data in database
- `getLimitTreeData()`: Retrieves limit data from database

**XML Processing Flow**:
1. Receive XML SOAP response
2. Parse XML document using DOMParser
3. Extract facility and customer information
4. Process additional facility details
5. Build hierarchical structure
6. Store in database with unique reference
7. Retrieve and format for downstream systems

**Interactions**:
- Uses `org.apache.xerces.parsers.DOMParser` for XML parsing
- Calls database functions via `FileProcessConnection`
- References EJB interfaces for integration

**XML Sample Processing**:
```java
Document d = getXMLDocument(xmlString);
NodeList nFcltyNb = d.getElementsByTagName("FcltyNb");
String strFcltyNb = nFcltyNb.item(0).getChildNodes().item(0).getNodeValue();
// Process additional nodes
// ...
```

### Security Implementation

#### TripleDES.java

**Location**: `src`

**Purpose**: Implements Triple DES encryption/decryption for secure data handling.

**Key Components**:
- Fixed encryption key defined as byte array
- Methods for encryption and decryption
- Utility methods for byte array manipulation

**Key String**:
```java
private static final String KEY_STRING = "167-42-158-164-248-173-50-74-193-73-82-185-76-145-247-188-167-42-158-164-248-173-50-74";
```

**Methods**:
- `encrypt()`: Encrypts string data using Triple DES
- `decrypt()`: Decrypts encrypted data
- `getKey()`: Creates secret key from key string
- `getBytes()` and `getString()`: Conversion utilities

**Encryption Implementation**:
```java
public String encrypt(String source) {
    try {
        // Get our secret key
        Key key = getKey();

        // Create the cipher
        Cipher desCipher = Cipher.getInstance("DESede");

        // Initialize the cipher for encryption
        desCipher.init(Cipher.ENCRYPT_MODE, key);

        // Our cleartext as bytes
        byte[] cleartext = source.getBytes();

        // Encrypt the cleartext
        byte[] ciphertext = desCipher.doFinal(cleartext);

        // Return a String representation of the cipher text
        return getString(ciphertext);
    } catch (Exception e) {
        // Error handling
    }
    return null;
}
```

**Security Considerations**:
- Uses hardcoded key (not ideal for production)
- Implements standard Triple DES algorithm
- No initialization vector management
- No key rotation mechanism

### Test and Utility Files

#### test.java

**Location**: Root package

**Purpose**: Simple test class for XML pattern matching.

**Implementation Details**:
- Uses regex pattern to replace XML tags
- Simple utility for development testing

**Regex Pattern**:
```java
String strPattern = "(<)([a-zA-Z0-9:]+)(>)(</)([a-zA-Z0-9:]+)(>)";
```

#### TeswtApp.java

**Location**: Root package

**Purpose**: Test application for various file processing capabilities.

**Key Test Cases**:
- File path/string token processing
- String masking and formatting
- File operations (reading, writing, conversion)
- Image processing tests
- Base64 encoding/decoding

**Implementation Details**:
- Contains multiple main methods for different test scenarios
- Includes commented-out test cases for various features
- Demonstrates file I/O, string manipulation, and error handling

**String Masking Example**:
```java
public static String maskNumber(String number, String mask) {
    int index = 0;
    StringBuilder masked = new StringBuilder();
    for (int i = 0; i < mask.length(); i++) {
        char c = mask.charAt(i);
        if (c == '#') {
            masked.append(number.charAt(index));
            index++;
        } else if (c == 'x') {
            masked.append(c);
            index++;
        } else {
            masked.append(c);
        }
    }
    return masked.toString();
}
```

#### TestFileProcess.java

**Location**: `src`

**Purpose**: Comprehensive test suite for the file processing framework.

**Key Test Methods**:
- `testFullFlow()`: Tests end-to-end file processing workflow
- `testChecksum()`: Tests checksum validation functionality
- `testChecksumAndCrypto()`: Tests combined checksum and encryption
- `testReConChecksum()`: Tests reconciliation checksum validation
- `testgetfeedConfig()`: Tests feed configuration retrieval

**Test Workflow**:
1. Set up test objects (MessageMasterVO, FileMasterVO, FeedConfigVO)
2. Configure test parameters
3. Call processing methods
4. Verify results

**Sample Test Method**:
```java
public static void testFullFlow() {
    try {
        FileProcess fp = new FileProcess();
        fp.process(
                "hdr_Tran_Id=BILLREG_XLS_IN~*hdr_Status=NULL~*FEED|BILLREG29052019001|BILLREG29052019001|BILLREG_XLS_IN|S|PDG11_BILLREG_IN_1605201900001.xls|/usr1/SIR11784/GTB_HOME/INTERFACE_HOME/BILLREG_XLS_IN/incoming/||003",
                "I");
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

### Integration Components

#### InwardMsgRedirect.java, OutGoingsRedirect.java, etc.

**Location**: `com.intellect.interfaces`

**Purpose**: Handle specific types of message redirections.

**Implementation Details**:
- Extend `FileProcessAbstract` for consistent processing framework
- Implement specific business logic for each message type
- Maintain consistent error handling and status updates

**Common Structure**:
```java
public class InwardMsgRedirect extends FileProcessAbstract {
    @Override
    public boolean process(MessageMasterVO messageMasterVO,
            FileMasterVO fileMasterVO, FeedConfigVO feedConfigVO)
            throws FileProcessException {
        // Message-specific processing logic
        // ...
    }
}
```

#### EFTRTGSUpdate.java, EFTRTGSInsert.java

**Location**: `com.intellect.interfaces`

**Purpose**: Handle Electronic Funds Transfer and Real-Time Gross Settlement operations.

**Key Functionality**:
- Database operations specific to EFT/RTGS transactions
- Status updates and tracking
- Error handling and reporting
- Transaction processing

**Business Logic**:
- Payment status updates
- Transaction logging
- Status file generation
- Notification processing

### Validation Framework

#### FileValidationInterface.java

**Location**: `com.intellect.interfaces.file`

**Purpose**: Interface defining the contract for file validation.

**Key Methods**:
- `validateFile()`: Validates file structure and content
- `isFileExist()`: Checks file existence
- `validateFileName()`: Validates file naming conventions

#### FileValidationFatory.java

**Location**: `com.intellect.interfaces.file`

**Purpose**: Factory class for creating file validation implementations.

**Factory Pattern Implementation**:
- Creates appropriate validator based on file type
- Supports extensibility for new file types
- Centralizes validator creation logic

#### MessageValidationInterface.java

**Location**: `com.intellect.interfaces.message`

**Purpose**: Interface for message validation.

**Validation Types**:
- Format validation
- Content validation
- Business rule validation
- Reference validation

### Common Constants and Error Codes

#### FileProcessConstants.java

**Location**: `com.intellect.interfaces.common`

**Purpose**: Constants used throughout the file processing system.

**Key Constants**:
- File status codes
- Delimiters
- Process flags
- Configuration keys

#### FileProcessErrorConstants.java

**Location**: `com.intellect.interfaces.common`

**Purpose**: Error codes and messages for the system.

**Error Categories**:
- File validation errors
- Database errors
- Processing errors
- Configuration errors
- Security errors

## Common Scenarios and Solutions

This section provides step-by-step guides for common scenarios that you might encounter when working with the Messaging Hub Financial Integration System.

### Scenario 1: Adding a New Feed Type

If you need to add support for a new feed type, follow these steps:

1. **Database Configuration**:
   - Add a new record to the `feed_config` table with appropriate configurations
   ```sql
   INSERT INTO feed_config (feed_name, feed_type, dir_path, file_name_validation_reqd, file_name_regex)
   VALUES ('NEW_FEED_TYPE', 'I', '/path/to/feed/directory', 'Y', '^NEW_FEED_[0-9]{8}[0-9]{6}\.txt$');
   ```

2. **Implementation Class**:
   - Create a new class extending `FileProcessAbstract`
   ```java
   package com.intellect.interfaces;
   
   public class NewFeedProcessor extends FileProcessAbstract {
       @Override
       public boolean process(MessageMasterVO messageMasterVO, FileMasterVO fileMasterVO, FeedConfigVO feedConfigVO) 
               throws FileProcessException {
           // Implementation specific to the new feed type
           // ...
           return true;
       }
   }
   ```

3. **Factory Registration**:
   - Register the new processor in `FileProcessFatory.java`
   ```java
   static {
       // Add this line to the static initializer
       fileProcessorMap.put("NEW_FEED_TYPE", new NewFeedProcessor());
   }
   ```

4. **Validation Rules**:
   - Implement any specific validation rules for the new feed type
   - Consider file format, checksums, and specific business rules

5. **Testing**:
   - Create test cases in `TestFileProcess.java` to verify the implementation
   ```java
   public static void testNewFeedType() {
       try {
           FileProcess fp = new FileProcess();
           fp.process("hdr_Tran_Id=NEW_FEED_TYPE~*hdr_Status=NULL~*FEED|REF123||NEW_FEED_TYPE||NEW_FEED_20231015120000.txt|/path/to/file/|", "I");
       } catch (Exception e) {
           e.printStackTrace();
       }
   }
   ```

### Scenario 2: Troubleshooting Checksum Validation Issues

When a file fails checksum validation, follow these steps to diagnose and resolve the issue:

1. **Verify Checksum Configuration**:
   - Check the feed configuration in the database
   ```sql
   SELECT feed_name, check_sum_validation_reqd, check_sum_algoritham, check_sum_avalible 
   FROM feed_config WHERE feed_name = 'YOUR_FEED_NAME';
   ```

2. **Examine the Problematic File**:
   - Open the file and verify the checksum format matches the expected location
   - For `LAST_LINE_WITH_PREFIX`, ensure the last line follows the format: `CHECKSUM|<hash_value>`
   - For `FIRST_LINE_OF_HDRFILE`, ensure the first line contains only the checksum

3. **Recreate the Checksum**:
   - Use the same algorithm (MD5, SHA-1, etc.) to generate a checksum for the file excluding the checksum line
   - Compare this with the checksum in the file

4. **Test with the Utility Method**:
   ```java
   FileCheckSumUtil util = new FileCheckSumUtil();
   boolean isValid = util.generateOrValidateCheckSum(fileName, filePath, "MD5", "CHECKSUM|", true);
   System.out.println("Checksum validation result: " + isValid);
   ```

5. **Common Issues and Resolutions**:
   - **Line endings**: Different systems use different line endings (CR, LF, CRLF). Ensure the checksum algorithm accounts for this.
   - **Encoding**: Files with different encodings may produce different checksums. Use consistent encoding.
   - **Hidden characters**: Some files may contain hidden characters. Use a hex editor to verify.

### Scenario 3: Implementing a Custom XML Parser for a New Response Format

When you need to parse a new XML format, follow these guidelines:

1. **Analyze the XML Structure**:
   - Identify the key elements and their relationships
   - Determine parent-child hierarchies
   - Map XML elements to Java objects

2. **Create Value Objects**:
   - Define Java classes to represent the XML data
   ```java
   public class NewResponseVO {
       private String responseId;
       private String status;
       private List<DetailVO> details;
       // Getters and setters
   }
   ```

3. **Implement the Parser**:
   ```java
   public NewResponseVO parseXML(String xmlStr) throws Exception {
       NewResponseVO response = new NewResponseVO();
       Document d = getXMLDocument(xmlStr);
       
       // Extract main elements
       NodeList statusNodes = d.getElementsByTagName("Status");
       if (statusNodes.getLength() > 0) {
           response.setStatus(statusNodes.item(0).getChildNodes().item(0).getNodeValue());
       }
       
       // Extract details
       NodeList detailNodes = d.getElementsByTagName("Detail");
       List<DetailVO> details = new ArrayList<>();
       for (int i = 0; i < detailNodes.getLength(); i++) {
           DetailVO detail = new DetailVO();
           Node detailNode = detailNodes.item(i);
           NodeList childNodes = detailNode.getChildNodes();
           
           // Process child nodes
           for (int j = 0; j < childNodes.getLength(); j++) {
               Node childNode = childNodes.item(j);
               String nodeName = childNode.getNodeName();
               
               if (nodeName.equals("Id")) {
                   detail.setId(childNode.getChildNodes().item(0).getNodeValue());
               } else if (nodeName.equals("Value")) {
                   detail.setValue(childNode.getChildNodes().item(0).getNodeValue());
               }
           }
           
           details.add(detail);
       }
       
       response.setDetails(details);
       return response;
   }
   ```

4. **Handle Namespaces Properly**:
   - XML namespaces can complicate parsing
   - Consider using namespace-aware parsing
   ```java
   Document getNamespaceAwareDocument(String xmlStr) throws Exception {
       DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
       factory.setNamespaceAware(true);
       DocumentBuilder builder = factory.newDocumentBuilder();
       return builder.parse(new InputSource(new StringReader(xmlStr)));
   }
   ```

5. **Error Handling**:
   - Implement robust error handling for malformed XML
   - Validate the XML against a schema if available
   - Log parsing errors with context for debugging

## Troubleshooting Guide

This section provides solutions to common issues that may occur in the Messaging Hub Financial Integration System.

### Database Connection Issues

**Symptom**: `FileProcessException` with error code 998 (SQL Exception)

**Possible Causes**:
1. Database server is unavailable
2. Connection pool exhaustion
3. Invalid credentials
4. Network connectivity problems

**Solutions**:
1. Verify database server status: `ping <database_host>`
2. Check connection pool settings in configuration
3. Verify credentials in connection properties
4. Check network connectivity and firewall settings
5. Review database logs for connection rejection reasons

**Example Debug Steps**:
```java
// Add this code temporarily to diagnose connection issues
try {
    Connection con = DriverManager.getConnection(url, username, password);
    System.out.println("Connection test successful");
    con.close();
} catch (SQLException e) {
    System.out.println("Connection error: " + e.getMessage());
    e.printStackTrace();
}
```

### File Not Found Errors

**Symptom**: `FileProcessException` with message "File not found" or error code 103

**Possible Causes**:
1. Incorrect file path in message
2. Directory permissions issues
3. File was moved or deleted before processing
4. Network mount issues for remote files

**Solutions**:
1. Verify the file path using absolute paths: `new File(filePath).getAbsolutePath()`
2. Check directory permissions: `ls -la <directory>`
3. Add file existence logging before processing
4. Implement retry logic for intermittent network issues
5. Use `FileProcessUtil.isFileExist()` method which includes detailed logging

**Code Example to Validate File Path**:
```java
File file = new File(fileMasterVO.getDirName() + File.separator + fileMasterVO.getFileName());
LOG.debug("Checking file existence: " + file.getAbsolutePath());
if (!file.exists()) {
    LOG.error("File does not exist: " + file.getAbsolutePath());
    throw new FileProcessException("File not found: " + file.getAbsolutePath(), 
            FileProcessErrorConstants.ERROR_CODE_FILE_NOT_FOUND);
}
```

### Checksum Validation Failures

**Symptom**: `FileProcessException` with error code 104 (Checksum Validation Failed)

**Possible Causes**:
1. File was corrupted during transmission
2. Checksum algorithm mismatch
3. Incorrect checksum location configuration
4. Line ending differences between systems

**Solutions**:
1. Re-generate the checksum using the same algorithm and compare
2. Verify the checksum algorithm in feed configuration
3. Check the file format and line endings
4. Enable debug logging for checksum validation
5. Test with `FileCheckSumUtil.generateOrValidateCheckSum()` directly

**Debugging Steps**:
```
1. Extract the checksum from the file manually
2. Generate a checksum for the file using the same algorithm (e.g., MD5)
3. Compare the two values
4. Check for whitespace or line ending differences
5. Verify the checksum location configuration
```

### XML Parsing Errors

**Symptom**: `SAXException` or other parsing exceptions

**Possible Causes**:
1. Malformed XML
2. XML not well-formed
3. Incorrect namespace handling
4. Character encoding issues

**Solutions**:
1. Validate the XML with an external validator
2. Check for special characters and proper escaping
3. Verify XML namespaces are handled correctly
4. Check character encoding (UTF-8, ISO-8859-1, etc.)
5. Use a more robust parser like JAXB for complex XML

**XML Validation Example**:
```java
// Add this code to validate XML before parsing
try {
    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
    factory.setValidating(true);
    DocumentBuilder builder = factory.newDocumentBuilder();
    builder.setErrorHandler(new ErrorHandler() {
        public void warning(SAXParseException e) throws SAXException {
            System.out.println("Warning: " + e.getMessage());
        }
        public void error(SAXParseException e) throws SAXException {
            System.out.println("Error: " + e.getMessage());
            throw e;
        }
        public void fatalError(SAXParseException e) throws SAXException {
            System.out.println("Fatal error: " + e.getMessage());
            throw e;
        }
    });
    builder.parse(new InputSource(new StringReader(xmlStr)));
    System.out.println("XML is valid");
} catch (Exception e) {
    System.out.println("XML validation failed: " + e.getMessage());
}
```

### Encryption/Decryption Failures

**Symptom**: `Exception` during encrypt/decrypt operations

**Possible Causes**:
1. Key mismatch
2. Algorithm implementation differences
3. Padding issues
4. Corrupted encrypted data

**Solutions**:
1. Verify the encryption key is correct
2. Check the encryption algorithm and mode
3. Ensure consistent padding mechanism
4. Verify the format of encrypted data
5. Test encryption/decryption with known good values

**Debug Example**:
```java
// Test encryption/decryption with a known value
TripleDES des = new TripleDES();
String original = "TestString123";
String encrypted = des.encrypt(original);
String decrypted = des.decrypt(encrypted);
System.out.println("Original: " + original);
System.out.println("Encrypted: " + encrypted);
System.out.println("Decrypted: " + decrypted);
System.out.println("Roundtrip successful: " + original.equals(decrypted));
```

## Developer Quick Reference

This section provides quick reference examples for common development tasks in the Messaging Hub Financial Integration System.

### Creating a New File Processor

```java
// 1. Create a new class extending FileProcessAbstract
public class CustomFeedProcessor extends FileProcessAbstract {
    private static final FileProcessLogger LOG = FileProcessLogger.getLogger(CustomFeedProcessor.class.getName());
    
    @Override
    public boolean process(MessageMasterVO messageMasterVO, FileMasterVO fileMasterVO, 
                         FeedConfigVO feedConfigVO) throws FileProcessException {
        LOG.debug("Starting process for: " + fileMasterVO.getFileName());
        
        try {
            // 1. Read the file
            String filePath = fileMasterVO.getDirName() + File.separator + fileMasterVO.getFileName();
            List<String> lines = Files.readAllLines(Paths.get(filePath));
            
            // 2. Process each line
            int totalRecords = 0;
            int successRecords = 0;
            
            for (String line : lines) {
                totalRecords++;
                // Custom processing logic
                // ...
                successRecords++;
            }
            
            // 3. Update statistics
            fileMasterVO.setTotalRecords(String.valueOf(totalRecords));
            fileMasterVO.setSuccessRecords(String.valueOf(successRecords));
            fileMasterVO.setFileProcessStatus(FileProcessConstants.FILE_PROCESSED);
            
            // 4. Update database
            FileProcessDAO dao = new FileProcessDAO();
            dao.updateFileMasterStatus(messageMasterVO, fileMasterVO);
            
            return true;
        } catch (Exception e) {
            LOG.error("Error processing file: " + fileMasterVO.getFileName(), e);
            throw new FileProcessException("Error processing file: " + e.getMessage(), 
                    FileProcessErrorConstants.EXCEPTION_CODE, e);
        }
    }
}

// 2. Register in the factory
// Add in FileProcessFatory.java static initializer
fileProcessorMap.put("CUSTOM_FEED", new CustomFeedProcessor());
```

### Working with the Graph Data Structure

```java
// Creating a graph structure for hierarchical data
Graph graph = new Graph();

// Add parent nodes
Node root = graph.getNode("ROOT");
root.setId("ROOT");

// Add child nodes
Node child1 = graph.getNode("CHILD1");
child1.setId("CHILD1");
child1.setParent("ROOT");
root.addAdjacentNodes(child1);

Node child2 = graph.getNode("CHILD2");
child2.setId("CHILD2");
child2.setParent("ROOT");
root.addAdjacentNodes(child2);

// Add grandchild nodes
Node grandchild1 = graph.getNode("GRANDCHILD1");
grandchild1.setId("GRANDCHILD1");
grandchild1.setParent("CHILD1");
child1.addAdjacentNodes(grandchild1);

// Traverse the graph
graph.breadthFirstTraversal(root);

// Custom traversal with data processing
Queue<Node> q = new LinkedList<>();
q.add(root);
root.setVisted(true);
while(!q.isEmpty()) {
    Node n = q.poll();
    
    // Process node data
    System.out.println("Processing node: " + n.getId());
    
    // Add child nodes to queue
    for(Node adj : n.adjacentNodes) {
        if(!adj.isVisted()) {
            adj.setVisted(true);
            q.add(adj);
        }
    }
}
```

### XML Processing Best Practices

```java
// 1. Parse XML safely
private Document parseXML(String xmlStr) throws Exception {
    try {
        StringReader sreader = new StringReader(xmlStr);
        InputSource is = new InputSource(sreader);
        DOMParser parser = new DOMParser();
        parser.setFeature("http://apache.org/xml/features/validation/dynamic", true);
        parser.setFeature("http://apache.org/xml/features/dom/include-ignorable-whitespace", false);
        parser.parse(is);
        return parser.getDocument();
    } catch (Exception e) {
        LOG.error("Error parsing XML: " + e.getMessage());
        // Log a truncated version of the XML for debugging
        LOG.error("XML content (truncated): " + 
                xmlStr.substring(0, Math.min(xmlStr.length(), 500)));
        throw e;
    }
}

// 2. Extract values safely
private String getNodeValue(Document doc, String tagName) {
    NodeList nodeList = doc.getElementsByTagName(tagName);
    if (nodeList != null && nodeList.getLength() > 0) {
        Node node = nodeList.item(0);
        if (node.hasChildNodes() && node.getFirstChild().getNodeType() == Node.TEXT_NODE) {
            return node.getFirstChild().getNodeValue();
        }
    }
    return null;
}

// 3. Handle namespaces correctly
private NodeList getNodesByTagNameAndNamespace(Document doc, String namespace, String tagName) {
    Element root = doc.getDocumentElement();
    return root.getElementsByTagNameNS(namespace, tagName);
}

// 4. Traverse complex structures
private void processChildElements(Node parentNode, Map<String, String> resultMap, String prefix) {
    NodeList childNodes = parentNode.getChildNodes();
    for (int i = 0; i < childNodes.getLength(); i++) {
        Node childNode = childNodes.item(i);
        if (childNode.getNodeType() == Node.ELEMENT_NODE) {
            String nodeName = childNode.getNodeName();
            if (childNode.hasChildNodes() && childNode.getFirstChild().getNodeType() == Node.TEXT_NODE) {
                resultMap.put(prefix + "." + nodeName, childNode.getFirstChild().getNodeValue());
            } else if (childNode.hasChildNodes()) {
                processChildElements(childNode, resultMap, prefix + "." + nodeName);
            }
        }
    }
}
```

### Database Operations Reference

```java
// 1. Getting a connection
Connection conn = null;
try {
    FileProcessConnection fpConnection = FileProcessConnection.getInstance();
    conn = fpConnection.getConnection();
    // Use the connection
    // ...
} finally {
    if (conn != null) {
        try {
            conn.close();
        } catch (SQLException e) {
            LOG.error("Error closing connection", e);
        }
    }
}

// 2. Executing a query with parameters
PreparedStatement pstmt = null;
ResultSet rs = null;
try {
    pstmt = conn.prepareStatement("SELECT * FROM feed_config WHERE feed_name = ?");
    pstmt.setString(1, feedName);
    rs = pstmt.executeQuery();
    
    while (rs.next()) {
        // Process results
        String dirPath = rs.getString("dir_path");
        String checkSumReqd = rs.getString("check_sum_validation_reqd");
        // ...
    }
} finally {
    if (rs != null) {
        try { rs.close(); } catch (SQLException e) { /* ignore */ }
    }
    if (pstmt != null) {
        try { pstmt.close(); } catch (SQLException e) { /* ignore */ }
    }
}

// 3. Executing an update
PreparedStatement updateStmt = null;
try {
    updateStmt = conn.prepareStatement(
        "UPDATE file_master SET file_process_status = ?, updated_dt = SYSDATE " +
        "WHERE bank_reference_id = ?");
    updateStmt.setString(1, FileProcessConstants.FILE_PROCESSED);
    updateStmt.setString(2, bankReferenceId);
    
    int rowsUpdated = updateStmt.executeUpdate();
    LOG.debug("Rows updated: " + rowsUpdated);
} finally {
    if (updateStmt != null) {
        try { updateStmt.close(); } catch (SQLException e) { /* ignore */ }
    }
}

// 4. Transaction handling
conn.setAutoCommit(false);
try {
    // Execute multiple statements
    // ...
    
    // Commit if everything succeeds
    conn.commit();
} catch (Exception e) {
    // Rollback on error
    try {
        conn.rollback();
    } catch (SQLException ex) {
        LOG.error("Error rolling back transaction", ex);
    }
    throw e;
} finally {
    // Reset auto-commit
    try {
        conn.setAutoCommit(true);
    } catch (SQLException e) {
        LOG.error("Error resetting auto-commit", e);
    }
}
```

### Error Handling Best Practices

```java
// 1. Proper exception hierarchy
try {
    // Business logic
} catch (FileNotFoundException e) {
    // Specific handling for file not found
    LOG.error("File not found: " + filePath, e);
    throw new FileProcessException("File not found: " + filePath, 
            FileProcessErrorConstants.ERROR_CODE_FILE_NOT_FOUND, e);
} catch (SQLException e) {
    // Specific handling for SQL errors
    LOG.error("Database error: " + e.getMessage(), e);
    throw new FileProcessException("Database error: " + e.getMessage(), 
            FileProcessErrorConstants.ERROR_CODE_SQL, e);
} catch (Exception e) {
    // General exception handling
    LOG.error("Unexpected error: " + e.getMessage(), e);
    throw new FileProcessException("Unexpected error: " + e.getMessage(), 
            FileProcessErrorConstants.EXCEPTION_CODE, e);
}

// 2. Maintaining context in exceptions
try {
    // Complex operation
} catch (Exception e) {
    LOG.error("Error processing file: " + fileMasterVO.getFileName() + 
            ", feed: " + fileMasterVO.getFeedName() + ", line: " + lineNumber, e);
    
    // Update error status in database
    fileMasterVO.setErrMsg(e.getMessage());
    fileMasterVO.setErrCode(String.valueOf(FileProcessErrorConstants.EXCEPTION_CODE));
    fileMasterVO.setFileProcessStatus(FileProcessConstants.FILE_FILEREJECTED);
    
    try {
        FileProcessDAO dao = new FileProcessDAO();
        dao.updateFileMasterStatus(messageMasterVO, fileMasterVO);
    } catch (Exception ex) {
        LOG.error("Error updating error status in database", ex);
    }
    
    throw new FileProcessException("Error processing file: " + e.getMessage(), 
            FileProcessErrorConstants.EXCEPTION_CODE, e);
}

// 3. Proper cleanup in finally blocks
FileInputStream fis = null;
try {
    fis = new FileInputStream(file);
    // Process file
} catch (Exception e) {
    // Handle exception
} finally {
    if (fis != null) {
        try {
            fis.close();
        } catch (IOException e) {
            LOG.error("Error closing file", e);
        }
    }
}
```

## Appendices

### Appendix A: Message Format Specifications

#### Incoming Message Format

Standard format for incoming messages:

```
hdr_Tran_Id=<FEED_NAME>~*hdr_Status=NULL~*FEED|<REFERENCE>||<FEED_NAME>||<FILE_NAME>|<DIRECTORY>|
```

Example:
```
hdr_Tran_Id=BILLREG_XLS_IN~*hdr_Status=NULL~*FEED|BILLREG29052019001|BILLREG29052019001|BILLREG_XLS_IN|S|PDG11_BILLREG_IN_1605201900001.xls|/usr1/SIR11784/GTB_HOME/INTERFACE_HOME/BILLREG_XLS_IN/incoming/||003
```

#### Limit Data Format

Format for limit data response:

```
Facility_id=<ID>~*GCIF=<CIF>~*Limit_Type=<TYPE>~*LimitCurrency=<CURRENCY>~*ProductCat=<CATEGORY>~*ProductName=<NAME>~*SancLimiAmount=<AMOUNT>~*UtilizedAmt=<UTILIZED>~*LimitStartDate=<START>~*LimitEndDate=<END>~*~*
```

### Appendix B: Database Schema

#### message_master Table

```sql
CREATE TABLE message_master (
    msg_ref_id VARCHAR2(50) PRIMARY KEY,
    msg_txt CLOB,
    flow CHAR(1),
    feed_name VARCHAR2(50),
    file_name VARCHAR2(100),
    dir_name VARCHAR2(200),
    process_status VARCHAR2(10),
    created_dt TIMESTAMP,
    updated_dt TIMESTAMP
);
```

#### file_master Table

```sql
CREATE TABLE file_master (
    bank_reference_id VARCHAR2(50) PRIMARY KEY,
    feed_name VARCHAR2(50),
    file_name VARCHAR2(100),
    dir_name VARCHAR2(200),
    process_status VARCHAR2(10),
    file_process_status VARCHAR2(10),
    total_records NUMBER,
    success_records NUMBER,
    failed_records NUMBER,
    err_code VARCHAR2(10),
    err_msg VARCHAR2(4000),
    created_dt TIMESTAMP,
    updated_dt TIMESTAMP
);
```

#### LIMIT_TREE_RESPONSE Table

```sql
CREATE TABLE LIMIT_TREE_RESPONSE (
    CIF VARCHAR2(50),
    EXP_DATE DATE,
    START_DATE DATE,
    FACILITY_ID VARCHAR2(50),
    LIMIT_AMOUNT VARCHAR2(50),
    UTILIZED_AMOUNT VARCHAR2(50),
    LABEL VARCHAR2(100),
    PARENT_ID VARCHAR2(50),
    CURRENT_ID VARCHAR2(50),
    REF_NO VARCHAR2(50)
);
```

### Appendix C: Common Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| 100 | Message Empty | Ensure message is not empty |
| 101 | Message Format Error | Check message format against specifications |
| 102 | Feed Maintenance Error | Verify feed configuration in database |
| 103 | File Not Found | Ensure file exists in specified location |
| 104 | Checksum Validation Failed | Verify file integrity |
| 105 | Decryption Failed | Check encryption keys and algorithms |
| 998 | SQL Exception | Check database connectivity and queries |
| 999 | General Exception | Check logs for detailed error information |

### Appendix D: Glossary

- **CIF**: Customer Information File - A unique identifier for a bank customer
- **EFT**: Electronic Funds Transfer
- **NEFT**: National Electronic Funds Transfer
- **RTGS**: Real-Time Gross Settlement
- **Feed**: A specific data exchange channel between systems
- **Checksum**: A value used to verify data integrity
- **Triple DES**: A symmetric-key block cipher that applies the DES cipher algorithm three times to each data block 